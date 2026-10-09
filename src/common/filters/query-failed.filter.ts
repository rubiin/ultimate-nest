import { STATUS_CODES } from "node:http";

import { DriverException } from "@mikro-orm/postgresql";
import { ServerException } from "@mikro-orm/postgresql";
import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpStatus } from "@nestjs/common";

@Catch(ServerException)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: DriverException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<NestifyResponse>();

    // The driver raises a typed subclass per Postgres SQLSTATE, so the class is
    // the only reliable signal - constraint names are not part of the error.
    const status =
      exception instanceof UniqueConstraintViolationException
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
    });
  }
}
