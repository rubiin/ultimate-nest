import { FileSizes, FileTypes } from "@common/types/enums";
import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import mime from "mime-types";
import { memoryStorage } from "multer";

const allowedExtensions = new Set(["png", "jpg", "jpeg"]);

export const ImageMulterOption: MulterOptions = {
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 mb
	},
	storage: memoryStorage(),
	fileFilter: (_request: Request, file, callback) => {
		if (!allowedExtensions.has(mime.extension(file.mimetype))) {
			return callback(new Error("Only image files are allowed!"), false);
		}

		return callback(null, true);
	},
};

export const fileValidatorPipe = ({
	fileType = FileTypes.IMAGE,
	fileSize = FileSizes.IMAGE,
	required = true,
}) => {
	return new ParseFilePipeBuilder()
		.addFileTypeValidator({
			fileType,
		})
		.addMaxSizeValidator({
			maxSize: fileSize,
		})
		.build({
			errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			fileIsRequired: required,
		});
};
