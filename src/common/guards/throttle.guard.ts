import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	protected errorMessage = "You've made too many requests, please try again later.";

	protected getTracker(request: Record<string, any>): string {
		return request.ips.length > 0 ? request.ips[0] : request.ip; // individualize IP extraction to meet your own needs
	}
}
