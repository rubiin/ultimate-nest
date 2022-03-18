import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import * as mime from 'mime-types';
import * as multer from 'multer';
import * as fs from 'fs';
import { extname } from 'path';

const allowedExtensions = new Set(['png', 'jpg', 'jpeg']);

export const ImageMulterOption: MulterOptions = {
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 mb
	},
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			const path = './uploads';

			// check if the folder exists
			if (!fs.existsSync(path)) {
				// create the folder
				fs.mkdirSync(path, { recursive: true });
			}

			return cb(null, path);
		},
		filename: (
			_req: Request,
			file: { originalname: string },
			cb: (arg0: any, arg1: string) => void,
		) => {
			let name = file.originalname.split('.')[0];

			// if filename length greater than 10, truncate to 10
			if (name.length > 8) {
				name = name.slice(0, 8);
			}

			const fileExtName = extname(file.originalname);
			const randomName = Date.now();

			cb(null, `${name}-${randomName}${fileExtName}`);
		},
	}),
	fileFilter: (_req: Request, file, cb) => {
		if (!allowedExtensions.has(mime.extension(file.mimetype))) {
			return cb(new Error('Only image files are allowed!'), false);
		}

		return cb(null, true);
	},
};
