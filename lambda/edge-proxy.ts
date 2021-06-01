import { CloudFrontRequestEvent } from "aws-lambda";

const isValidRoute = /^https?:\/\//;
const hasExtension = /(.+)\.[a-zA-Z0-9]{2,5}$/;

export const handler = async (
  event: CloudFrontRequestEvent,
  context: unknown
) => {
  console.debug(event);
  const request = event.Records[0].cf.request;
  const url: string = request.uri;

  // if the route is valid and hast no extension fetch we right html page from s3
  if (url && url.match(isValidRoute) && !url.match(hasExtension)) {
    request.uri = `${url}.html`;
  }

  console.debug(request);

  return request;
};
