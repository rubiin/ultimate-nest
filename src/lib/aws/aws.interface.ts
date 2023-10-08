import type { ObjectCannedACL } from "@aws-sdk/client-s3";

export interface AwsS3 {
  baseUrl: string
  completedUrl: string
  filename: string
  mime: string
  path: string
  pathWithFilename: string
}

export interface AwsS3MultiPart extends AwsS3 {
  uploadId: string
}

export interface AwsS3PutItemOptions {
  acl?: ObjectCannedACL
  path: string
}

export interface AwsModuleOptions {
  accessKeyId: string
  baseUrl: string
  bucket: string
  secretAccessKey: string
  region: string
}
