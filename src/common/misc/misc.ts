import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import * as mime from 'mime-types';
import * as multer from 'multer';
import { extname } from 'path';

const allowedExtensions: any = ['png', 'jpg', 'jpeg'];

export const ImageMulterOption: MulterOptions = {
	dest: './upload',
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 mb
	},
	storage: multer.diskStorage({
		filename: (
			_req: Request,
			file: { originalname: string },
			cb: (arg0: any, arg1: string) => void,
		) => {
			const name = file.originalname.split('.')[0];
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
