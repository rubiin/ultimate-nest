import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import fs from "fs";
import mime from "mime-types";
import multer from "multer";
import { extname } from "path";

const allowedExtensions = new Set(["png", "jpg", "jpeg"]);

export const diskStorageConfig = multer.diskStorage({
	destination: (request, file, callback) => {
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
	storage: multer.memoryStorage(),
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
