import process from "node:process";

import { IS_PUBLIC_KEY_META, SWAGGER_API_ENDPOINT } from "@common/constant";
import { swaggerOptions } from "@common/swagger/swagger.plugin";
import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import { AppUtils } from "./app.utils";
import { HelperService } from "./helpers.utils";

const { createDocument, setup } = vi.hoisted(() => ({
  createDocument: vi.fn<() => unknown>(),
  setup: vi.fn<() => void>(),
}));

vi.mock("@nestjs/swagger", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nestjs/swagger")>()),
  SwaggerModule: { createDocument, setup },
}));

// `getMiddleware` registers process-wide prom-client metrics on first call and throws on the
// second, so it is stubbed and the auth check is asserted through the captured options.
const { getMiddleware } = vi.hoisted(() => ({
  getMiddleware: vi.fn<(options: unknown) => () => void>(() => () => undefined),
}));

vi.mock("swagger-stats", () => ({ getMiddleware }));

class Account {
  self?: Account;
}

describe("AppUtils.gracefulShutdown", () => {
  const stubApp = () =>
    ({ close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined) }) as never;

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
    const app = { close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined) };

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
    const close = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

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
    const app = {
      close: vi.fn<() => Promise<void>>().mockRejectedValue(new Error("boom")),
    } as never;

    await AppUtils.gracefulShutdown(app, "SIGTERM");

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should force-exit when the close never settles", async () => {
    const app = {
      close: vi.fn<() => Promise<void>>().mockReturnValue(new Promise(() => undefined)),
    } as never;

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

  it("strips unknown properties and only enables debug messages in dev", () => {
    vi.spyOn(HelperService, "isDev").mockReturnValue(true);

    expect(AppUtils.validationPipeOptions()).toEqual({
      enableDebugMessages: true,
      forbidUnknownValues: false,
      transform: true,
      validateCustomDecorators: false,
      whitelist: true,
    });

    vi.spyOn(HelperService, "isDev").mockReturnValue(false);
    expect(AppUtils.validationPipeOptions().enableDebugMessages).toBe(false);
  });
});

describe("AppUtils.setupSwagger", () => {
  const app = () => ({ use: vi.fn<() => void>() }) as unknown as INestApplication;

  const configService = () =>
    ({
      get: (key: string) =>
        key === "app.swagger"
          ? { password: "swagger-password", username: "swagger-user" }
          : "ultimate-nest",
    }) as unknown as ConfigService<Configs, true>;

  beforeEach(() => {
    vi.clearAllMocks();
    setup.mockReturnValue(undefined);
    createDocument.mockReturnValue({
      paths: {
        "/posts": {
          // Swagger v12 records `security` entries as plain scheme names, not objects.
          get: { security: [IS_PUBLIC_KEY_META] },
          post: { security: ["accessToken"] },
        },
        "/health": { get: {} },
      },
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("strips the internal public marker from every documented operation", () => {
    AppUtils.setupSwagger(app(), configService());

    const document = createDocument.mock.results[0]?.value as {
      paths: Record<string, Record<string, { security?: unknown[] }>>;
    };

    expect(document.paths["/posts"]?.get?.security).toEqual([]);
    expect(document.paths["/posts"]?.post?.security).toEqual(["accessToken"]);
    expect(document.paths["/health"]?.get?.security).toBeUndefined();
  });

  it("serves the explorer and registers the auth-gated stats middleware", () => {
    const target = app();

    AppUtils.setupSwagger(target, configService());

    expect(setup).toHaveBeenCalledWith(
      SWAGGER_API_ENDPOINT,
      target,
      expect.anything(),
      expect.objectContaining({ explorer: true, swaggerOptions }),
    );
    expect(target.use).toHaveBeenCalledWith(expect.any(Function));
  });

  it("authenticates the stats middleware with the configured swagger credentials", () => {
    AppUtils.setupSwagger(app(), configService());

    const options = getMiddleware.mock.calls[0]?.[0] as {
      authentication: boolean;
      hostname: string;
      onAuthenticate: (request: unknown, username: string, password: string) => boolean;
      uriPath: string;
    };

    expect(options).toMatchObject({
      authentication: true,
      hostname: "ultimate-nest",
      uriPath: "/stats",
    });
    expect(options.onAuthenticate({}, "swagger-user", "swagger-password")).toBe(true);
    expect(options.onAuthenticate({}, "swagger-user", "wrong")).toBe(false);
    expect(options.onAuthenticate({}, "someone-else", "swagger-password")).toBe(false);
  });
});
