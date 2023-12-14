import { STATUS_CODES } from "node:http";

import type { DriverException } from "@mikro-orm/postgresql";
import { ServerException } from "@mikro-orm/postgresql";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpStatus } from "@nestjs/common";

@Catch(ServerException)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: DriverException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<NestifyResponse>();

    const status
            = exception.name && exception.name.startsWith("UQ")
              ? HttpStatus.CONFLICT
              : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
    });
  }
}
