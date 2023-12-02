import type { Buffer } from "node:buffer";
import type {
  Bucket,
} from "@aws-sdk/client-s3";
import {
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { Inject, Injectable } from "@nestjs/common";
import { lookup } from "mime-types";

import { isEmpty, omit } from "helper-fns";
import type { Observable } from "rxjs";
import { forkJoin, from, map, of, switchMap, throwError } from "rxjs";
import {
  AwsModuleOptions,
} from "./aws.interface";
import type {

  AwsS3,
  AwsS3MultiPart,
  AwsS3PutItemOptions,
} from "./aws.interface";
import { MODULE_OPTIONS_TOKEN } from "./aws.module";

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AwsModuleOptions,
  ) {
    this.s3Client = new S3Client(omit(options, ["bucket", "baseUrl"]));

    this.bucket = this.options.bucket;
    this.baseUrl = this.options.baseUrl;
  }

  /**
   * The function "listBucket" asynchronously retrieves a list of bucket names from an S3 client and
   * returns them as an array of strings.
   * @returns An array of strings, which are the names of the buckets.
   */
  listBucket(): Observable<string[]> {
    return from(this.s3Client.send(new ListBucketsCommand({}))).pipe(
      switchMap((listBucket) => {
        if (!listBucket?.Buckets)
          return of([]);

        return of(listBucket.Buckets.map((value: Bucket) => value.Name ?? ""));
      }),
    );
  }

  /**
   * The function `listItemInBucket` retrieves a list of objects in an AWS S3 bucket and maps them to a
   * custom interface.
   * @param prefix - The `prefix` parameter is an optional string that represents a prefix to
   * filter the objects in the S3 bucket. It is used to retrieve only the objects whose keys start with
   * the specified prefix. If no prefix is provided, all objects in the bucket will be listed.
   * @returns The function `listItemInBucket` returns an array of objects of type `IAwsS3[]`.
   */

  listItemInBucket(prefix?: string): Observable<AwsS3[]> {
    return from(this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      }),
    )).pipe(
      map((response) => {
        if (response && response.Contents) {
          return response.Contents.map((value) => {
            if (!value.Key)
              return {};
            const lastIndex = value.Key.lastIndexOf("/");
            const path = value.Key.slice(0, lastIndex);
            const filename = value.Key.slice(lastIndex, value.Key.length);

            const mime = this.getMime(filename);
            return {
              path,
              pathWithFilename: value.Key,
              filename,
              completedUrl: `${this.baseUrl}/${value.Key}`,
              baseUrl: this.baseUrl,
              mime,
            };
          }).filter(value => isEmpty(value)) as AwsS3[];
        }
        return [];
      }),
    );
  }

  /**
   * The function `getItemInBucket` retrieves an item from an S3 bucket using the specified filename and
   * optional path.
   * @param filename - The filename parameter is a string that represents the name of the file
   * you want to retrieve from the bucket.
   * @param path - The `path` parameter is an optional string that represents the directory or
   * subdirectory within the bucket where the file is located. If provided, it will be appended to the
   * filename to form the complete key for retrieving the file from the bucket.
   * @returns the body of the item retrieved from the specified bucket in the AWS S3 storage.
   */
  getItemInBucket(
    filename: string,
    path?: string,
  ): Observable<Record<string, any>> {
    const key: string = path ? `${path}/${filename}` : filename;
    return from(this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )).pipe(switchMap((item) => {
      if (!item.Body)
        return throwError(() => "Item not found");

      return of(item.Body);
    }));
  }

  /**
   * The function generates a unique file name by appending a timestamp, random number, and replacing
   * spaces with hyphens.
   * @param originalFilename - The `originalFilename` parameter is a string that represents the
   * name of the file that needs to be generated.
   * @returns A string value.
   */
  private generateFileName(originalFilename: string): string {
    const [name, extension] = originalFilename.split(".");
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 10_000,
    )}-${name}.${extension}`;

    return fileName.replaceAll(" ", "-");
  }

  /**
   * The function "getMime" takes a file name as input and returns the corresponding MIME type based
   * on the file's extension.
   * @param fileName - The `fileName` parameter is a string that represents the name of a file,
   * including its extension.
   * @returns A string, which is the MIME type associated with the file extension.
   */
  private getMime(fileName: string): string {
    const extension = fileName
      .slice(fileName.lastIndexOf(".") + 1, fileName.length)
      .toUpperCase();
    const fileMime = lookup(extension);
    return fileMime || extension;
  }

  /**
   * The `putItemInBucket` function uploads a file to an AWS S3 bucket and returns information about the
   * uploaded file.
   * @param originalFilename - The original filename of the item being uploaded to the S3
   * bucket.
   * @param content - The `content` parameter is the actual content of the file
   * that you want to put in the S3 bucket. It can be either a `Uint8Array` or a `Buffer` object.
   * @param options - The `options` parameter is an optional object that can
   * contain additional configuration options for uploading the item to the S3 bucket. It can include
   * properties such as ACL (Access Control List), CacheControl, ContentDisposition, ContentEncoding,
   * ContentLanguage, Metadata, and StorageClass. These options allow you to
   * @returns The function `putItemInBucket` returns an object of type `IAwsS3`.
   */
  putItemInBucket(
    originalFilename: string,
    content: Uint8Array | Buffer,
    options?: AwsS3PutItemOptions,
  ): Observable<AwsS3> {
    const filename = options?.keepOriginalName ? originalFilename : this.generateFileName(originalFilename);
    const { key, mime, path } = this.getOptions(filename, options);
    return from(this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: mime,
      }),
    )).pipe(map(_response => ({
      path,
      pathWithFilename: key,
      filename,
      completedUrl: `${this.baseUrl}/${key}`,
      baseUrl: this.baseUrl,
      mime,
    })));
  }

  /**
   * The `deleteItemInBucket` function deletes a file with the specified filename from an S3 bucket.
   * @param filename - The filename parameter is a string that represents the name of the file
   * you want to delete from the bucket.
   * @returns The function `deleteItemInBucket` returns a Promise that resolves to void.
   */
  deleteItemInBucket(filename: string): Observable<any> {
    return from(this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      }),
    ));
  }

  /**
   * The `deleteItemsInBucket` function deletes multiple items from an S3 bucket using their filenames.
   * @param filenames - The `filenames` parameter is an array of strings that represents the
   * names of the files you want to delete from a bucket.
   * @returns The function `deleteItemsInBucket` returns a Promise that resolves to void.
   */

  deleteItemsInBucket(filenames: string[]): Observable<any> {
    const keys = filenames.map(value => ({
      Key: value,
    }));

    return from(this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys,
        },
      }),
    ));
  }

  /**
   * The `deleteFolder` function deletes a folder and all its contents from an S3 bucket.
   * @param directory - The `directory` parameter is a string that represents the name or path
   * of the folder you want to delete from an S3 bucket.
   * @returns The function `deleteFolder` returns a Promise that resolves to void.
   */
  deleteFolder(directory: string): Observable<any> {
    const listObjectsObservable = from(
      this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: directory,
        }),
      ),
    );

    return listObjectsObservable.pipe(
      map((lists) => {
        if (!lists || !lists?.Contents)
          return [];

        return lists.Contents.map(value => ({
          Key: value.Key,
        }));
      },
      ),
      switchMap(listItems =>
        forkJoin([
          from(
            this.s3Client.send(
              new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: {
                  Objects: listItems,
                },
              }),
            ),
          ),
          from(
            this.s3Client.send(
              new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: directory,
              }),
            ),
          ),
        ]),
      ),
    );
  }

  /**
   * The `createMultiPart` function creates a multipart upload for a file in AWS S3 and returns
   * information about the upload.
   * @param filename - The filename parameter is a string that represents the name of the file
   * that will be uploaded to AWS S3.
   * @param options - The `options` parameter is an optional object that can
   * contain additional configuration options for the S3 upload. It can have the following properties:
   * @returns The function `createMultiPart` returns a Promise that resolves to an object of type
   * `AwsS3MultiPart`.
   */
  createMultiPart(
    filename: string,
    options?: AwsS3PutItemOptions,
  ): Observable<AwsS3MultiPart> {
    const { key, mime, path, acl } = this.getOptions(filename, options);

    return from(this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ACL: acl,
      }),
    )).pipe(map(response => ({
      uploadId: response?.UploadId ?? "",
      path,
      pathWithFilename: key,
      filename,
      completedUrl: `${this.baseUrl}/${key}`,
      baseUrl: this.baseUrl,
      mime,
    })));
  }

  /**
   * The function `getOptions` returns an object containing key, mime, path, and acl based on the
   * provided options and filename.
   * @param fileName - The `fileName` parameter is a string that represents the name of the
   * file.
   * @param options - An object containing optional parameters for the AWS S3 Put
   * Item operation.
   * @returns An object with the properties `key`, `mime`, `path`, and `acl`.
   */
  private getOptions(fileName: string, options?: AwsS3PutItemOptions) {
    let path = options?.path ?? fileName;
    const acl = options?.acl ?? "public-read";

    if (path)
      path = path.startsWith("/") ? path.replace("/", "") : `${path}`;

    const key = path ? `${path}/${fileName}` : fileName;
    const mime = this.getMime(fileName);

    return { key, mime, path, acl };
  }

  /**
   * The `uploadPart` function uploads a part of a file to an AWS S3 bucket using the AWS SDK for
   * JavaScript.
   * @param fileName - The filename parameter is a string that represents the name of the file
   * being uploaded.
   * @param content - The `content` parameter is a `Buffer` that represents the content of the
   * file being uploaded. It is the actual data that will be uploaded to the S3 bucket.
   * @param uploadId - The `uploadId` parameter is a unique identifier for the multipart upload.
   * It is obtained when initiating the multipart upload and is used to associate the uploaded parts with
   * the correct upload.
   * @param partNumber - The `partNumber` parameter represents the number of the part being
   * uploaded. In a multipart upload, a large file is divided into smaller parts, and each part is
   * uploaded separately. The `partNumber` is used to identify the order of the parts and ensure they are
   * assembled correctly when the upload is
   * @param options - The `options` parameter is an optional object that
   * contains additional configuration options for the upload. It is of type `IAwsS3PutItemOptions`.
   * @returns The function `uploadPart` returns a Promise that resolves to void.
   */
  uploadPart(
    fileName: string,
    content: Buffer,
    uploadId: string,
    partNumber: number,
    options?: AwsS3PutItemOptions,
  ): Observable<any> {
    let path = options?.path ?? undefined;

    if (path)
      path = path.startsWith("/") ? path.replace("/", "") : `${path}`;

    const key = path ? `${path}/${fileName}` : fileName;

    return from(this.s3Client.send(
      new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        PartNumber: partNumber,
        UploadId: uploadId,
      }),
    ));
  }
}
