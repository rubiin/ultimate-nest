import { Inject, Injectable, Logger } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 } from "cloudinary";
import { Readable } from "stream";
import { CLOUDINARY_MODULE_OPTIONS } from "./cloudinary.constant";
import { CloudinaryModuleOptions } from "./cloudinary.options";

@Injectable()
export class CLoudinaryService {
	constructor(
		@Inject(CLOUDINARY_MODULE_OPTIONS)
		private readonly options: CloudinaryModuleOptions,
	) {}

	private readonly logger: Logger = new Logger(CLoudinaryService.name);

	async uploadImage(
		file: Express.Multer.File,
	): Promise<UploadApiResponse | UploadApiErrorResponse> {
		return new Promise((resolve, reject) => {
			const cloudinary = v2.config({
				cloud_name: this.options.cloudName,
				api_key: this.options.apiKey,
				api_secret: this.options.apiKey,
			});
			const upload = cloudinary.uploader.upload_stream(
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				},
			);
			const stream: Readable = new Readable();

			stream.push(file.buffer);
			stream.push(null);

			stream.pipe(upload);
		});
	}
}
