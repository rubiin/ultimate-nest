import { FileSize, FileType, FileValidator } from "@common/@types";
import { MULTER_IMAGE_FILTER } from "@common/constant";
import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import { memoryStorage } from "multer";

export const ImageMulterOption: MulterOptions = {
	limits: {
		fileSize: FileSize.IMAGE, // 5 MB
	},
	storage: memoryStorage(),
	fileFilter: (_request: Request, file, callback) => {
		if (!FileType.IMAGE.test(file.mimetype)) {
			return callback(new Error(MULTER_IMAGE_FILTER), false);
		}

		return callback(null, true);
	},
};

/**
 *
 * It takes in a fileType, fileSize, and required boolean and returns a ParseFilePipeBuilder object
 * with the fileType and fileSize validators added to it
 * @param {FileValidator}  - IFileValidator
 * @returns A function that returns a ParseFilePipeBuilder
 *
 */
export const fileValidatorPipe = ({
	fileType = FileType.IMAGE,
	fileSize = FileSize.IMAGE,
	required = true,
}: FileValidator) => {
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
