import { Logger } from "@nestjs/common";
import { type ResilienceEvent, ResilienceEvents } from "@nestjs/resilience";
import { Subject } from "rxjs";

import { ResilienceLogger } from "./resilience.logger";

describe("ResilienceLogger", () => {
  // A real Subject, so the spec exercises the subscription `onModuleInit` sets up
  // rather than calling the handler directly. Rebuilt per test: completing it
  // in `afterEach` would make every later `.next()` a no-op.
  let events: Subject<ResilienceEvent>;
  let logger: ResilienceLogger;
  let warn: ReturnType<typeof vi.spyOn>;
  let log: ReturnType<typeof vi.spyOn>;
  let debug: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    events = new Subject<ResilienceEvent>();
    logger = new ResilienceLogger({ events$: events.asObservable() } as ResilienceEvents);
    warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    debug = vi.spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);
    logger.onModuleInit();
  });

  afterEach(() => {
    logger.onApplicationShutdown();
    vi.restoreAllMocks();
  });

  it("warns when a breaker opens, naming the policy and the source", () => {
    events.next({
      from: "closed",
      policy: "mail",
      source: "AuthController.forgotPassword",
      to: "open",
      type: "circuit-open",
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Circuit "mail" went from closed to open'),
      "AuthController.forgotPassword",
    );
  });

  it("warns when a bulkhead sheds load, with its occupancy", () => {
    events.next({
      active: 5,
      policy: "cloudinary",
      queued: 10,
      reason: "full",
      source: "UserController.create",
      type: "bulkhead-rejected",
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("(5 running, 10 queued)"));
  });

  // Retries are the high-volume event: a dependency that recovers on its second
  // attempt should not reach the warn level.
  it("keeps retries at debug", () => {
    events.next({
      attempt: 1,
      delayMs: 200,
      error: new Error("boom"),
      policy: "rabbitmq",
      source: "NewsLetterService.publishNewsLetter",
      type: "retry",
    });

    expect(debug).toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("logs a fallback at info, since the caller still got an answer", () => {
    events.next({
      error: new Error("circuit open"),
      policy: "mail",
      source: "AuthController.forgotPassword",
      type: "fallback",
    });

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("AuthController.forgotPassword answered with its fallback"),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("labels an event with no source as unknown rather than undefined", () => {
    events.next({ policy: "mail", timeoutMs: 10000, type: "timeout" });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("at unknown"));
  });

  it("stops logging once the application shuts down", () => {
    logger.onApplicationShutdown();

    events.next({ policy: "mail", timeoutMs: 10000, type: "timeout" });

    expect(warn).not.toHaveBeenCalled();
  });
});
