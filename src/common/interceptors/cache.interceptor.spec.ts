import { createMock } from "@golevelup/ts-vitest";
import { ExecutionContext, Reflector } from "@nestjs/core";

import { CacheKeyInterceptor } from "./cache.interceptor";

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

  // Regression: `CacheInterceptor` never assigns `httpAdapterHost`, so reading it threw.
  it("should not depend on an assigned httpAdapterHost", () => {
    expect(() => interceptor.trackBy(build({ url: "/profile" }))).not.toThrow();
  });
});
