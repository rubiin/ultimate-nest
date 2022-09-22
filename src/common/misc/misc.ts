import fs from "node:fs";
import { extname } from "node:path";

import { FileSizes, FileTypes } from "@common/types/enums";
import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import mime from "mime-types";
import { diskStorage, memoryStorage } from "multer";

const allowedExtensions = new Set(["png", "jpg", "jpeg"]);

export const diskStorageConfig = diskStorage({
	destination: (_request, _file, callback) => {
		const path = "./uploads";

		// check if the folder exists
		if (!fs.existsSync(path)) {
			// create the folder
			fs.mkdirSync(path, { recursive: true });
		}

		return callback(null, path);
	},
	filename: (
		_request: Request,
		file: { originalname: string },
		callback: (argument0: any, argument1: string) => void,
	) => {
		callback(null, randomFileName(file));
	},
});

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

export const randomFileName = (file: { originalname: string }): string => {
	let name = file.originalname.split(".")[0];

	// if filename length greater than 10, truncate to 10
	if (name.length > 8) {
		name = name.slice(0, 8);
	}

	const fileExtensionName = extname(file.originalname);
	const randomName = Date.now();

	return `${name}-${randomName}${fileExtensionName}`;
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
