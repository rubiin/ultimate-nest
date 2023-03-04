import { ImageMulterOption } from "@common/misc";
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

interface IApiFileOptions {
	fieldName?: string;
	required?: boolean;
}

/**
 * It's a decorator that uses the Multer FileInterceptor to intercept a file upload and save it to the
 * server
 * @param [fieldName=file] - The name of the file in the form.
 * @returns A function that returns a function that returns a function.
 */
export const ApiFile = (options_?: IApiFileOptions) => {
	const options: IApiFileOptions = { fieldName: "file", required: false, ...options_ };

	return applyDecorators(
		UseInterceptors(FileInterceptor(options.fieldName)),
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
