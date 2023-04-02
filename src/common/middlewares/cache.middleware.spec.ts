import { createMock } from "@golevelup/ts-jest";
import { CacheService } from "@lib/cache/cache.service";
import { Request, Response } from "express";

import { ClearCacheMiddleware } from "./cache.middleware";

describe("ClearCacheMiddleware", () => {
	let middleware: ClearCacheMiddleware;
	const mockCacheService = createMock<CacheService>();

	beforeEach(() => {
		middleware = new ClearCacheMiddleware(mockCacheService);
	});
	const mockRequest = createMock<Request>({
		query: {
			clearCache: "true",
		},
	});
	const mockResponse = createMock<Response>();

	it("should be defined", () => {
		expect(middleware).toBeDefined();
	});

	describe("use", () => {
		it("should clear cache", async () => {
			mockCacheService.resetCache.mockReturnValue(Promise.resolve());

			const mockNext = jest.fn();

			await middleware.use(mockRequest, mockResponse, mockNext);

			expect(mockCacheService.resetCache).toBeCalled();
			expect(mockNext).toBeCalled();
		});
	});
});
