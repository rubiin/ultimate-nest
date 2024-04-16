import { UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import type {
  MulterField,
  MulterOptions,
} from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiProduces } from "@nestjs/swagger";
import type {
  ReferenceObject,
  SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

interface ApiFileOptions {
  fieldName?: string
  required?: boolean
  localOptions?: MulterOptions
}

interface ApiFilesOptions extends ApiFileOptions {
  maxCount?: number
}

/**
 * It's a decorator that uses the Multer FileInterceptor to intercept a file upload and save it to the
 * server
 * @param options_ - IApiFileOptions - The options for the decorator.
 * @returns A function that returns a decorator.
 */
export function ApiFile(options_?: ApiFileOptions) {
  const options = { fieldName: "file", required: false, ...options_ } satisfies ApiFilesOptions;

  return applyDecorators(
    UseInterceptors(FileInterceptor(options.fieldName, options.localOptions)),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        required: options.required ? [options.fieldName] : [],
        properties: {
          [options.fieldName]: {
            type: "string",
            format: "binary",
          },
        },
      },
    }),
  );
}

/**
 * It adds the `@UseInterceptors(FilesInterceptor(...))` decorator to the route handler, and adds the
 * `@ApiConsumes("multipart/form-data")` and `@ApiBody({...})` decorators to the route handler
 * @param options_ - The options for the decorator.
 * @returns A function that returns a decorator.
 */
export function ApiFiles(options_?: ApiFilesOptions) {
  const options = {
    fieldName: "files",
    required: false,
    maxCount: 10,
    ...options_,
  } satisfies ApiFilesOptions;

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(options.fieldName, options.maxCount, options.localOptions),
    ),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        required: options.required ? [options.fieldName] : [],
        properties: {
          [options.fieldName]: {
            type: "array",
            items: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
    }),
  );
}

/**
 * It takes an array of MulterFields and returns a decorator that will add the appropriate OpenAPI
 * schema to the endpoint
 * @param options - An array of MulterFields.
 * @param localOptions - These are the options that are passed to
 * multer.
 */

export function ApiFileFields(options: (MulterField & { required?: boolean })[], localOptions?: MulterOptions) {
  const bodyProperties = Object.assign(
    {},
    ...options.map((field) => {
      return { [field.name]: { type: "string", format: "binary" } };
    }),
  ) as Record<string, SchemaObject | ReferenceObject>;

  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(options, localOptions)),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        properties: bodyProperties,
        required: options.filter(f => f.required).map(f => f.name),
      },
    }),
  );
}

export function ApiFileResponse(...mimeTypes: string[]) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiProduces(...mimeTypes),
  );
}
