import {
	ArgumentMetadata,
	Injectable,
	PipeTransform,
	BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseFilePipe implements PipeTransform {
	transform(
		files: Express.Multer.File | Express.Multer.File[],
		_metadata: ArgumentMetadata,
	): Express.Multer.File | Express.Multer.File[] {
		if (files === undefined || files === null) {
			throw new BadRequestException("Validation failed (file expected)");
		}

		if (Array.isArray(files) && files.length === 0) {
			throw new BadRequestException("Validation failed (files expected)");
		}

		return files;
	}
}
