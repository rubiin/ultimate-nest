import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { THROTTLE_LIMIT_RESPONSE } from "@common/constant";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = THROTTLE_LIMIT_RESPONSE;

  protected async getTracker(request: Request): Promise<string> {
    return request.ips.length > 0 ? request.ips[0] : request.ip;
  }
}
