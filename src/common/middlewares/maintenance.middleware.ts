import type {
  NestMiddleware,
} from "@nestjs/common";
import {
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

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
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: "Service is under maintenance",
      });
    }

    next();
  }
}
