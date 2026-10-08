import { ERROR_CODES } from "@common/constant";
import { NestMiddleware } from "@nestjs/common";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";

@Injectable()
export class SettingMaintenanceMiddleware implements NestMiddleware {
  async use(
    _request: NestifyRequest,
    _response: NestifyResponse,
    next: NestifyNextFunction,
  ): Promise<void> {
    const maintenance: boolean = true;
    // TODO: get maintenance status from database

    if (maintenance) {
      // `errorCode` must sit in the body object: `HttpException.createBody` returns an
      // object response verbatim and drops one passed via the options argument.
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: "Service is under maintenance",
        errorCode: ERROR_CODES.SERVICE_UNDER_MAINTENANCE,
      });
    }

    next();
  }
}
