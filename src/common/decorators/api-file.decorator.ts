import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
	MulterField,
	MulterOptions,
} from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import {
	ReferenceObject,
	SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

interface ApiFileOptions {
	fieldName?: string;
	required?: boolean;
	localOptions?: MulterOptions;
}

interface ApiFilesOptions extends ApiFileOptions {
	maxCount?: number;
}

/**
 * It's a decorator that uses the Multer FileInterceptor to intercept a file upload and save it to the
 * server
 * @returns A function that returns a function that returns a function.
 * @param options_
 */
export const ApiFile = (options_?: ApiFileOptions) => {
	const options: ApiFileOptions = { fieldName: "file", required: false, ...options_ };

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
};

/**
 * It adds the `@UseInterceptors(FilesInterceptor(...))` decorator to the route handler, and adds the
 * `@ApiConsumes("multipart/form-data")` and `@ApiBody({...})` decorators to the route handler
 * @param {ApiFilesOptions} [options_] - IApiFilesOptions - The options for the decorator.
 * @returns A function that returns a decorator.
 */
export const ApiFiles = (options_?: ApiFilesOptions) => {
	const options: ApiFilesOptions = {
		fieldName: "files",
		required: false,
		maxCount: 10,
		...options_,
	};

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
};

/**
 * It takes an array of MulterFields and returns a decorator that will add the appropriate OpenAPI
 * schema to the endpoint
 * @param {(MulterField & { required?: boolean })[]} options - An array of MulterFields.
 * @param {MulterOptions} [localOptions] - MulterOptions - These are the options that are passed to
 * multer.
 */

export const ApiFileFields = (
	options: (MulterField & { required?: boolean })[],
	localOptions?: MulterOptions,
) => {
	const bodyProperties: Record<string, SchemaObject | ReferenceObject> = Object.assign(
		{},
		...options.map(field => {
			return { [field.name]: { type: "string", format: "binary" } };
		}),
	);

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
};
