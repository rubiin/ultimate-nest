import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from "@nestjs/common";
import { type ResilienceEvent, ResilienceEvents } from "@nestjs/resilience";
import type { Subscription } from "rxjs";

/**
 * Surfaces the transitions worth alerting on: a breaker that opens, a bulkhead
 * that sheds load. Retries stay at `debug` - they are the noisy ones, and a
 * dependency that recovers on the second attempt never needed a page.
 */
@Injectable()
export class ResilienceLogger implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger("Resilience");
  private subscription?: Subscription;

  constructor(private readonly resilienceEvents: ResilienceEvents) {}

  onModuleInit() {
    this.subscription = this.resilienceEvents.events$.subscribe((event) => this.log(event));
  }

  onApplicationShutdown() {
    this.subscription?.unsubscribe();
  }

  private log(event: ResilienceEvent) {
    const origin = event.source ?? "unknown";

    switch (event.type) {
      case "circuit-open":
      case "circuit-half-open":
      case "circuit-closed":
        this.logger.warn(
          `Circuit "${event.policy}" went from ${event.from} to ${event.to}`,
          origin,
        );
        return;
      case "bulkhead-rejected":
        this.logger.warn(
          `Bulkhead "${event.policy}" rejected ${origin}: ${event.reason} (${event.active} running, ${event.queued} queued)`,
        );
        return;
      case "circuit-rejected":
        this.logger.warn(
          `Circuit "${event.policy}" shed load from ${origin}, retry in ${event.retryAfterMs}ms`,
        );
        return;
      case "rate-limited":
        this.logger.warn(
          `Outbound rate limit "${event.policy}" rejected ${origin}, retry in ${event.retryAfterMs}ms`,
        );
        return;
      case "fallback":
        this.logger.log(`${origin} answered with its fallback for "${event.policy}"`);
        return;
      case "retry":
        this.logger.debug(
          `"${event.policy}" attempt ${event.attempt} failed at ${origin}, retrying in ${event.delayMs}ms`,
        );
        return;
      case "timeout":
        this.logger.warn(`"${event.policy}" timed out after ${event.timeoutMs}ms at ${origin}`);
    }
  }
}
