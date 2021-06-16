import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origin from "@aws-cdk/aws-cloudfront-origins";
import { relative, resolve } from "path";

export interface AwsNextjsProps {
  frontendName: string;
  /**
   * path to directory there the asset of the frontend is stored
   */
  pathToFrontend: string;
  /**
   * configurations for the cloudfront distribution
   * S3Origin is set by default
   */
  distributionProps?: cloudfront.DistributionProps;
}

/**
 * To create the Edge function the us-east-1 stage must be bootstraped
 */
export class AwsNextjs extends cdk.Construct {
  public readonly staticS3Bucket: s3.IBucket;
  public readonly edgeProxy: cloudfront.experimental.EdgeFunction;
  public readonly cloudfrontDistribution: cloudfront.Distribution;

  constructor(scope: cdk.Construct, id: string, props: AwsNextjsProps) {
    super(scope, id);

    // the asset bucket
    this.staticS3Bucket = new s3.Bucket(this, `${props.frontendName}`);
    new s3deploy.BucketDeployment(this, `FrontedSourceCode-${props.frontendName}`, {
      sources: [s3deploy.Source.asset(props.pathToFrontend)],
      destinationBucket: this.staticS3Bucket,
    })

    // the proxy function
    this.edgeProxy = new cloudfront.experimental.EdgeFunction(
      this,
      "edge-proxy",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "edge-proxy.handler",
        code: lambda.Code.fromAsset(`${resolve(__dirname)}/../lambda/`),
      }
    );

    // the cloudfront Distribution with the edge function
    this.cloudfrontDistribution = new cloudfront.Distribution(
      this,
      `${props.frontendName}-dist`,
      {
        defaultBehavior: {
          origin: new origin.S3Origin(this.staticS3Bucket),
          edgeLambdas: [
            {
              functionVersion: this.edgeProxy.currentVersion,
              eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            },
          ],
        },
        ...props.distributionProps,
      }
    );
  }
}
