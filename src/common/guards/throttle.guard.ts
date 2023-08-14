import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLE_LIMIT_RESPONSE } from '@common/constant';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = THROTTLE_LIMIT_RESPONSE;

  protected getTracker(request: Record<string, any>): string {
    return request.ips.length > 0 ? request.ips[0] : request.ip; // individualize IP extraction to meet your own needs
  }
}
