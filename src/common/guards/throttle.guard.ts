import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { THROTTLE_LIMIT_RESPONSE } from "@common/constant";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = THROTTLE_LIMIT_RESPONSE;

  protected async getTracker(request: Request): Promise<string> {
    if (request.ips.length > 0 && request.ips[0])
      return request.ips[0];
    else if (request.ip)
      return request.ip;

    throw new Error("Unable to get IP address");
  }
}
