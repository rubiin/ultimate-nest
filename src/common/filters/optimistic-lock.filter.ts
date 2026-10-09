import { STATUS_CODES } from "node:http";

import { OptimisticLockError } from "@mikro-orm/postgresql";
import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpStatus } from "@nestjs/common";

// Kept apart from `QueryFailedFilter`: this is an ORM-level `ValidationError`
// raised before/without a driver error, so it does not share that filter's
// `ServerException` catch type.
@Catch(OptimisticLockError)
export class OptimisticLockFilter implements ExceptionFilter {
  catch(_exception: OptimisticLockError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<NestifyResponse>();
    const status = HttpStatus.CONFLICT;

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
    });
  }
}
