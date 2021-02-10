import { Response } from 'express';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	InternalServerErrorException,
} from '@nestjs/common';

@Catch(InternalServerErrorException)
export class InternalServerExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message:
				'Sorry, the servers are unavailable at the moment. Please try again later.',
		});
	}
}
