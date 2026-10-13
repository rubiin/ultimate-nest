import { createMock } from "@golevelup/ts-vitest";
import { mockCacheService } from "@mocks";
import { lastValueFrom, of, throwError } from "rxjs";

import { ClearCacheInterceptor } from "./clear-cache.interceptor";

describe("clearCacheInterceptor", () => {
  let interceptor: ClearCacheInterceptor;

  const buildContext = (method: string, statusCode: number) =>
    createMock({
      switchToHttp: () => ({
        getRequest: () => ({ method }),
        getResponse: () => ({ statusCode }),
      }),
    });

  beforeEach(() => {
    vi.clearAllMocks();

    interceptor = new ClearCacheInterceptor(mockCacheService);
    mockCacheService.resetCache.mockResolvedValue(true);
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should reset the cache after a successful mutation", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("POST", 201) as never, { handle: () => of({}) }),
    );

    expect(mockCacheService.resetCache).toHaveBeenCalled();
  });

  it("should reset the cache for other successful methods", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("DELETE", 200) as never, { handle: () => of({}) }),
    );

    expect(mockCacheService.resetCache).toHaveBeenCalled();
  });

  it("should not reset the cache for a GET request", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("GET", 200) as never, { handle: () => of({}) }),
    );

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });

  it("should not reset the cache for a failed mutation", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("POST", 500) as never, { handle: () => of({}) }),
    );

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });

  it("should pass the handler result through untouched", async () => {
    const payload = { id: 1 };

    const result = await lastValueFrom(
      interceptor.intercept(buildContext("POST", 201) as never, { handle: () => of(payload) }),
    );

    expect(result).toBe(payload);
  });

  it("should not reset the cache when the handler errors", async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(buildContext("POST", 201) as never, {
          handle: () => throwError(() => new Error("handler blew up")),
        }),
      ),
    ).rejects.toThrow("handler blew up");

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });

  // Regression: the previous version used `tap` with a discarded `from(resetCache())`, so a
  // cache-clear failure was never awaited and became an unhandled rejection while the handler
  // still returned 200. `switchMap` now propagates the clear failure.
  it("should propagate a cache-clear failure instead of swallowing it", async () => {
    mockCacheService.resetCache.mockRejectedValue(new Error("redis went away"));

    await expect(
      lastValueFrom(
        interceptor.intercept(buildContext("POST", 201) as never, {
          handle: () => of({ ok: true }),
        }),
      ),
    ).rejects.toThrow("redis went away");
  });

  // A handler that emits a lazy body (e.g. a file stream) has to be unwrapped before the
  // clear runs, otherwise the cache is wiped before the body has even been sent.
  it("should defer the clear until an emitted stream has completed", async () => {
    const streamed = of({ streamed: true });

    await lastValueFrom(
      interceptor.intercept(buildContext("POST", 201) as never, { handle: () => of(streamed) }),
    );

    expect(mockCacheService.resetCache).toHaveBeenCalledTimes(1);
  });

  it("should defer the clear for an emitted promise body", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("POST", 201) as never, {
        handle: () => of(Promise.resolve({ streamed: true })),
      }),
    );

    expect(mockCacheService.resetCache).toHaveBeenCalledTimes(1);
  });

  it("should not clear the cache for a streamed GET", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("GET", 200) as never, {
        handle: () => of(of({ streamed: true })),
      }),
    );

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });

  // Regression: a stream failure used to be swallowed and the raw Observable itself returned
  // as the response body.
  it("should not clear the cache when a streamed body fails", async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext("POST", 201) as never, {
        handle: () => of(throwError(() => new Error("stream blew up"))),
      }),
    );

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });

  it("should not reset the cache when the handler errors", async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(buildContext("POST", 201) as never, {
          handle: () => throwError(() => new Error("handler blew up")),
        }),
      ),
    ).rejects.toThrow("handler blew up");

    expect(mockCacheService.resetCache).not.toHaveBeenCalled();
  });
});
