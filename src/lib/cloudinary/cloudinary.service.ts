/* eslint-disable import/named */
import { Readable } from "node:stream";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

import { MODULE_OPTIONS_TOKEN } from "./cloudinary.module-definition";
import { CloudinaryModuleOptions } from "./cloudinary.options";

@Injectable()
export class CloudinaryService {
	private logger = new Logger(CloudinaryService.name);

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: CloudinaryModuleOptions,
	) {}

	/**
	 * It takes a file, shrinks it to 800px wide, uploads it to Cloudinary, and returns the response from
	 * Cloudinary
	 * @param file - Express.Multer.File - This is the file that was uploaded by the user.
	 * @returns A promise that resolves to an UploadApiResponse or UploadApiErrorResponse
	 */
	async uploadFile(
		file: Express.Multer.File,
	): Promise<UploadApiResponse | UploadApiErrorResponse> {
		return new Promise(async (resolve, reject) => {
			cloudinary.config({
				cloud_name: this.options.cloudName,
				api_key: this.options.apiKey,
				api_secret: this.options.apiSecret,
			});

			const upload = cloudinary.uploader.upload_stream(
				(
					error: any,
					result:
						| UploadApiResponse
						| UploadApiErrorResponse
						| PromiseLike<UploadApiResponse | UploadApiErrorResponse>,
				) => {
					if (error) {
						this.logger.error(error);

						return reject(error);
					} else {
						resolve(result);
					}
				},
			);

			const images = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

			const stream: Readable = new Readable();

			if (images.includes(file.mimetype)) {
				const shrinkedImage = await sharp(file.buffer).resize(800).toBuffer();

				stream.push(shrinkedImage);
			} else {
				stream.push(file.buffer);
			}
			stream.push(null);

			stream.pipe(upload);
		});
	}
}
