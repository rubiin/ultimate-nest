import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class AppExceptionFilter implements ExceptionFilter {
	constructor(private readonly i18n: I18nService) {}

	async catch(exception: HttpException, host: ArgumentsHost) {
		const res = host.switchToHttp().getResponse<Response>();

		const statusCode = exception.getStatus();
		const response = exception.getResponse() as {
			statusCode: number;
			message: string | string[];
			error: string;
		};
		let message = response.message;

		message = await this.i18n.translate(response.message as string, {
			lang: host.switchToHttp().getRequest().i18nLang,
		});

		res.status(statusCode).json({ statusCode, message });
	}
}
