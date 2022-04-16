import { Injectable, PipeTransform } from "@nestjs/common";
import * as path from "path";
import * as sharp from "sharp";

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
export class SharpPipe
	implements PipeTransform<Express.Multer.File, Promise<string>>
{
	async transform(image: Express.Multer.File): Promise<string> {
		const originalName = path.parse(image.originalname).name;
		const filename = Date.now() + "-" + originalName + ".webp";

		await sharp(image.buffer)
			.resize(800)
			.webp({ effort: 3 })
			.toFile(path.join("uploads", filename));

		return filename;
	}
}
