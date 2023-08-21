import type { ObjectCannedACL } from "@aws-sdk/client-s3";

export interface IAwsS3 {
  path: string;
  pathWithFilename: string;
  filename: string;
  completedUrl: string;
  baseUrl: string;
  mime: string;
}

export interface IAwsS3MultiPart extends IAwsS3 {
  uploadId: string;
}

export interface IAwsS3PutItemOptions {
  path: string;
  acl?: ObjectCannedACL;
}

export interface AwsModuleOptions {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  baseUrl: string;
}
