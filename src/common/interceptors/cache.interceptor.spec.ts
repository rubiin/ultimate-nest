import { createMock } from "@golevelup/ts-vitest";
import { ExecutionContext, Reflector } from "@nestjs/core";

import { CacheKeyInterceptor, HttpCacheInterceptor } from "./cache.interceptor";

describe("CacheKeyInterceptor", () => {
  const reflector = createMock<Reflector>();
  const interceptor = new CacheKeyInterceptor(createMock<never>(), reflector);

  const build = (request: object, cacheable = true) => {
    vi.spyOn(interceptor, "isRequestCacheable").mockReturnValue(cacheable);

    return createMock<ExecutionContext>({
      getArgByIndex: (index: number) => (index === 0 ? request : undefined),
      getHandler: () => function handler() {},
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    reflector.get.mockReturnValue(undefined);
  });

  // Regression: the key was "undefined_<id>" without @CacheKey, because `request.user!`
  // was asserted on a route that may have no user.
  it("should key by url when no @CacheKey metadata is present", () => {
    expect(interceptor.trackBy(build({ url: "/profile" }))).toBe("/profile");
  });

  it("should prefer the query string when the request carries one", () => {
    expect(interceptor.trackBy(build({ originalUrl: "/users?page=2", url: "/users" }))).toBe(
      "/users?page=2",
    );
  });

  it("should use @CacheKey metadata when present", () => {
    reflector.get.mockReturnValue("profile");

    expect(interceptor.trackBy(build({ url: "/profile" }))).toBe("profile");
  });

  it("should return undefined for a request that is not cacheable", () => {
    expect(interceptor.trackBy(build({ url: "/profile" }, false))).toBeUndefined();
  });

  // Regression: without a user suffix, `GET /users` was replayed to the next caller.
  it("should append the caller id so a per-user GET is never shared", () => {
    expect(interceptor.trackBy(build({ url: "/profile", user: { id: "user-1" } }))).toBe(
      "/profile:user:user-1",
    );
  });

  it("should ignore a user object with no id", () => {
    expect(interceptor.trackBy(build({ url: "/profile", user: {} }))).toBe("/profile");
  });

  // Regression: `CacheInterceptor` never assigns `httpAdapterHost`, so reading it threw.
  it("should not depend on an assigned httpAdapterHost", () => {
    expect(() => interceptor.trackBy(build({ url: "/profile" }))).not.toThrow();
  });
});

describe("HttpCacheInterceptor", () => {
  const reflector = createMock<Reflector>();
  const interceptor = new HttpCacheInterceptor(createMock<never>(), reflector);

  const build = (request: object, ignoreCaching: unknown = undefined) => {
    reflector.get.mockReturnValue(ignoreCaching);

    return createMock<ExecutionContext>({
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => function handler() {},
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cache a GET that is not marked to ignore caching", () => {
    const context = build({ method: "GET", url: "/users" });

    expect(interceptor.isRequestCacheable(context)).toBe(true);
    expect(interceptor.trackBy(context)).toBe("/users");
  });

  it("should not cache a non-GET request", () => {
    const context = build({ method: "POST", url: "/users" });

    expect(interceptor.isRequestCacheable(context)).toBe(false);
    expect(interceptor.trackBy(context)).toBeUndefined();
  });

  it("should not cache when the handler is marked to ignore caching", () => {
    const context = build({ method: "GET", url: "/users" }, true);

    expect(interceptor.isRequestCacheable(context)).toBe(false);
  });

  it("should prefer the query string when building the key", () => {
    const context = build({ method: "GET", originalUrl: "/users?page=2", url: "/users" });

    expect(interceptor.trackBy(context)).toBe("/users?page=2");
  });

  it("should append the caller id to the key", () => {
    const context = build({ method: "GET", url: "/profile", user: { id: "user-1" } });

    expect(interceptor.trackBy(context)).toBe("/profile:user:user-1");
  });
});
