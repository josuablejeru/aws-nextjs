import "@aws-cdk/assert/jest";
import * as cdk from "@aws-cdk/core";
import * as AwsNextjs from "../lib/index";

describe("resources are created and wired", () => {
  // stack and app init
  const region = "eu-central-1";
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack", {
    env: { region: region },
  });

  // construct
  new AwsNextjs.AwsNextjs(stack, "MyTestConstruct", {
    frontendName: "MyTestFrontend",
  });

  test("Distribution can be created", () => {
    expect(stack).toHaveResource("AWS::CloudFront::Distribution");
  });

  test("Lambda Edge Function can be created", () => {
    expect(stack).toHaveResource("AWS::Lambda::Function");
  });

  test("S3 Bucket can be created", () => {
    expect(stack).toHaveResource("AWS::S3::Bucket");
  });
});
