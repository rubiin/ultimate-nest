import { MULTER_IMAGE_FILTER } from "@common/constant";
import { FileSizes, FileTypes, IFileValidator } from "@common/types";
import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import { memoryStorage } from "multer";

export const ImageMulterOption: MulterOptions = {
	limits: {
		fileSize: FileSizes.IMAGE, // 5 mb
	},
	storage: memoryStorage(),
	fileFilter: (_request: Request, file, callback) => {
		if (!FileTypes.IMAGE.test(file.mimetype)) {
			return callback(new Error(MULTER_IMAGE_FILTER), false);
		}

		return callback(null, true);
	},
};

export const fileValidatorPipe = ({
	fileType = FileTypes.IMAGE,
	fileSize = FileSizes.IMAGE,
	required = true,
}: IFileValidator) => {
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
