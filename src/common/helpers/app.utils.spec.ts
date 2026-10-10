import process from "node:process";

import { ValidationPipe } from "@nestjs/common";

import { AppUtils } from "./app.utils";

class Account {
  self?: Account;
}

describe("AppUtils.gracefulShutdown", () => {
  const stubApp = () => ({ close: vi.fn().mockResolvedValue(undefined) }) as never;

  beforeEach(() => {
    AppUtils.isShuttingDown = false;
    vi.useFakeTimers();
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    vi.spyOn(process, "on").mockImplementation((() => process) as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Regression: `enableShutdownHooks()` and `killAppWithGrace()` both registered SIGINT/SIGTERM
  // listeners, so one signal closed the app twice.
  it("should register exactly one listener per signal", () => {
    const app = { close: vi.fn().mockResolvedValue(undefined) };

    AppUtils.killAppWithGrace(app as never);

    const signals = vi
      .mocked(process.on)
      .mock.calls.map(([signal]) => signal)
      .filter((signal) => signal === "SIGINT" || signal === "SIGTERM");

    expect(signals).toEqual(["SIGINT", "SIGTERM"]);
  });

  it("should close the app once and exit cleanly", async () => {
    const app = stubApp();

    await AppUtils.gracefulShutdown(app, "SIGTERM");

    expect(
      vi.mocked(app as never as { close: ReturnType<typeof vi.fn> }).close,
    ).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  // Regression: a second signal arriving mid-close started a second `app.close()`.
  it("should ignore a repeat signal while a close is in flight", async () => {
    const close = vi.fn().mockResolvedValue(undefined);

    await Promise.all([
      AppUtils.gracefulShutdown({ close } as never, "SIGINT"),
      AppUtils.gracefulShutdown({ close } as never, "SIGTERM"),
    ]);

    expect(close).toHaveBeenCalledTimes(1);
  });

  // Regression: the force-exit timer was never cleared, so a healthy shutdown kept the
  // event loop alive for the full budget.
  it("should clear the force-exit timer after a clean close", async () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");

    await AppUtils.gracefulShutdown(stubApp(), "SIGTERM");

    expect(clearSpy).toHaveBeenCalled();
  });

  it("should exit with a failure code when the close rejects", async () => {
    const app = { close: vi.fn().mockRejectedValue(new Error("boom")) } as never;

    await AppUtils.gracefulShutdown(app, "SIGTERM");

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should force-exit when the close never settles", async () => {
    const app = { close: vi.fn().mockReturnValue(new Promise(() => undefined)) } as never;

    void AppUtils.gracefulShutdown(app, "SIGTERM");
    vi.advanceTimersByTime(AppUtils.shutdownTimeoutMs);

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe("AppUtils.validationPipeOptions", () => {
  // Regression: with `validateCustomDecorators` on, the global pipe ran the `@LoggedInUser()` entity
  // (a cyclic MikroORM graph) through `stripProtoKeys`, which overflowed the stack on every route
  // that injects the user.
  it("passes a cyclic custom-decorator value through untouched", async () => {
    const pipe = new ValidationPipe(AppUtils.validationPipeOptions());
    const account = new Account();
    account.self = account;

    await expect(pipe.transform(account, { metatype: Account, type: "custom" })).resolves.toBe(
      account,
    );
  });
});
