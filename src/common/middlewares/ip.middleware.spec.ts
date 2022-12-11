import { createMock } from "@golevelup/ts-jest";
import * as realIp from "@supercharge/request-ip";
import { Request, Response } from "express";

import { RealIpMiddleware } from "./ip.middleware";

describe("RealIpMiddleware", () => {
	let middleware: RealIpMiddleware;

	beforeEach(() => {
		middleware = new RealIpMiddleware();
	});
	const mockRequest = createMock<Request>();
	const mockResponse = createMock<Response>();

	it("should be defined", () => {
		expect(middleware).toBeDefined();
	});

	describe("use", () => {
		it("should return real ip", () => {
			jest.spyOn(realIp, "getClientIp").mockReturnValue("192.168.1.1");

			const mockNext = jest.fn();

			middleware.use(mockRequest, mockResponse, mockNext);

			expect(realIp.getClientIp).toBeCalled();
			expect(realIp.getClientIp).toBeCalledWith(mockRequest);
			expect(mockRequest.ip).toBe("192.168.1.1");
			expect(mockNext).toBeCalled();
		});
	});
});
