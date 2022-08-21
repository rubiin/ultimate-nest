/* eslint-disable import/named */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { CLOUDINARY_MODULE_OPTIONS } from "./cloudinary.constant";
import { CloudinaryModuleOptions } from "./cloudinary.options";
import sharp from "sharp";

@Injectable()
export class CloudinaryService {
	private logger = new Logger(CloudinaryService.name);

	constructor(
		@Inject(CLOUDINARY_MODULE_OPTIONS)
		private readonly options: CloudinaryModuleOptions,
	) {}

	/**
	 * It takes a file, shrinks it to 800px wide, uploads it to Cloudinary, and returns the response from
	 * Cloudinary
	 * @param file - Express.Multer.File - This is the file that was uploaded by the user.
	 * @returns A promise that resolves to an UploadApiResponse or UploadApiErrorResponse
	 */
	async uploadImage(
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
						this.logger.log(result);
						resolve(result);
					}
				},
			);
			const stream: Readable = new Readable();

			const shrinkedImage = await sharp(file.buffer).resize(800).toBuffer();

			stream.push(shrinkedImage);
			stream.push(null);

			stream.pipe(upload);
		});
	}
}
