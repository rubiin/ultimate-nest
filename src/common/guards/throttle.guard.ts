import { translate } from "@lib/i18n";
import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Translated per request, so it cannot be a static `errorMessage`.
  protected async getErrorMessage() {
    return translate("exception.tooManyRequests");
  }

  protected async getTracker(request: NestifyRequest): Promise<string> {
    if (request?.ips.length > 0 && request?.ips[0]) return request.ips[0];
    else if (request?.ip) return request.ip;

    throw new Error("Unable to get IP address");
  }
}
