import type { ObjectCannedACL, S3ClientConfig } from "@aws-sdk/client-s3";

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
  keepOriginalName?: boolean
}

export interface AwsModuleOptions extends S3ClientConfig {
  bucket: string
  baseUrl: string
}
