import { STATUS_CODES } from "node:http";

import { DriverException, ServerException } from "@mikro-orm/core";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(ServerException)
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
