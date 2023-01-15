import { ImageMulterOption } from "@common/misc";
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

/**
 * It's a decorator that uses the Multer FileInterceptor to intercept a file upload and save it to the
 * server
 * @param [fieldName=file] - The name of the file in the form.
 * @returns A function that returns a function that returns a function.
 */
export const ApiFile = (fieldName = "file", required = false) => {
	return applyDecorators(
		UseInterceptors(FileInterceptor(fieldName, ImageMulterOption)),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				required: required ? [fieldName] : [],
				properties: {
					[fieldName]: {
						type: "string",
						format: "binary",
					},
				},
			},
		}),
	);
};
