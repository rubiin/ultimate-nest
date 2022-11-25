import { ImageMulterOption } from "@common/misc/misc";
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";

export function ApiFile(name = "file") {
	return applyDecorators(
		UseInterceptors(FileInterceptor(name, ImageMulterOption)),
		ApiConsumes("multipart/form-data"),
	);
}
