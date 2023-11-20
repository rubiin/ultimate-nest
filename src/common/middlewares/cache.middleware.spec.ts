import { createMock } from "@golevelup/ts-jest";
import { mockCacheService, mockResponse } from "@mocks";
import { ClearCacheMiddleware } from "./cache.middleware";

describe("clearCacheMiddleware", () => {
  let middleware: ClearCacheMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new ClearCacheMiddleware(mockCacheService);
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
      mockCacheService.resetCache.mockReturnValue(Promise.resolve());

      const mockNext = jest.fn();

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockCacheService.resetCache).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
