import { ImageMulterOption } from "@common/misc/misc";
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";

/**
 * It's a decorator that uses the Multer FileInterceptor to intercept a file upload and save it to the
 * server
 * @param [name=file] - The name of the file in the form.
 * @returns A function that returns a function that returns a function.
 */
export const ApiFile = (name = "file") => {
	return applyDecorators(
		UseInterceptors(FileInterceptor(name, ImageMulterOption)),
		ApiConsumes("multipart/form-data"),
	);
};
