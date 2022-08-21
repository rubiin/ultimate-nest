import { DriverException, UniqueConstraintViolationException } from "@mikro-orm/core";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { STATUS_CODES } from "http";

@Catch(UniqueConstraintViolationException)
export class QueryFailedFilter implements ExceptionFilter {
	catch(exception: DriverException, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();

		const status =
			exception.name && exception.name.startsWith("UQ")
				? HttpStatus.CONFLICT
				: HttpStatus.INTERNAL_SERVER_ERROR;

		response.status(status).json({
			statusCode: status,
			error: STATUS_CODES[status],
		});
	}
}
