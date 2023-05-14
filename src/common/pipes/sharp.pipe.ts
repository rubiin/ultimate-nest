import path from "node:path";

import { File } from "@common/@types";
import { Injectable, PipeTransform } from "@nestjs/common";
import sharp from "sharp";

/**
 *
 *  Usage:
 *  uploadImage(@UploadedFile(SharpPipe) image: string)
 *
 * This only works for files that are uploaded through multer with file storage
 *
 *
 */

@Injectable()
export class SharpPipe implements PipeTransform<File, Promise<string>> {
	async transform(image: File): Promise<string> {
		const originalName = path.parse(image.originalname).name;
		const filename = Date.now() + "-" + originalName + ".webp";

		await sharp(image.buffer)
			.resize(800)
			.webp({ effort: 3 })
			.toFile(path.join("uploads", filename));

		return filename;
	}
}
