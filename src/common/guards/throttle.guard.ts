import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	protected errorMessage = "You've made too many requests, please try again later.";

	protected getTracker(req: Record<string, any>): string {
		return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
	}
}
