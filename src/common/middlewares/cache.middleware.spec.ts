import process from "node:process";

import { HelperService } from "@common/helpers";
import { createMock } from "@golevelup/ts-vitest";
import { mockCacheService, mockResponse } from "@mocks";

import { ClearCacheMiddleware } from "./cache.middleware";

describe("clearCacheMiddleware", () => {
  let middleware: ClearCacheMiddleware;

  beforeEach(() => {
    vi.clearAllMocks();
    middleware = new ClearCacheMiddleware(mockCacheService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  const mockRequest = createMock<NestifyRequest>({
    query: {
      clearCache: "true",
    },
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  describe("use", () => {
    it("should clear cache", async () => {
      mockCacheService.resetCache.mockReturnValue(Promise.resolve(true));

      const mockNext = vi.fn<() => void>();

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockCacheService.resetCache).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should ignore the request when the flag is absent", async () => {
      const mockNext = vi.fn<() => void>();

      await middleware.use(createMock<NestifyRequest>({ query: {} }), mockResponse, mockNext);

      expect(mockCacheService.resetCache).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    // Regression: in production the wipe used to run for any anonymous request.
    it("should ignore a mismatched token in production", async () => {
      vi.spyOn(HelperService, "isProd").mockReturnValue(true);
      const mockNext = vi.fn<() => void>();

      await middleware.use(
        createMock<NestifyRequest>({ query: { clearCache: "true", clearCacheToken: "wrong" } }),
        mockResponse,
        mockNext,
      );

      expect(mockCacheService.resetCache).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should clear the cache when the token matches in production", async () => {
      vi.spyOn(HelperService, "isProd").mockReturnValue(true);
      process.env.CACHE_CLEAR_TOKEN = "secret-token";
      const mockNext = vi.fn<() => void>();

      await middleware.use(
        createMock<NestifyRequest>({
          query: { clearCache: "true", clearCacheToken: "secret-token" },
        }),
        mockResponse,
        mockNext,
      );

      expect(mockCacheService.resetCache).toHaveBeenCalled();
      delete process.env.CACHE_CLEAR_TOKEN;
    });
  });
});
