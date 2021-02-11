import {
	DriverException,
	UniqueConstraintViolationException,
} from '@mikro-orm/core';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { STATUS_CODES } from 'http';

@Catch(UniqueConstraintViolationException)
export class QueryFailedFilter implements ExceptionFilter {
	constructor(public reflector: Reflector) {}

	catch(exception: DriverException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status =
			exception.name && exception.name.startsWith('UQ')
				? HttpStatus.CONFLICT
				: HttpStatus.INTERNAL_SERVER_ERROR;

		response.status(status).json({
			statusCode: status,
			error: STATUS_CODES[status],
		});
	}
}
