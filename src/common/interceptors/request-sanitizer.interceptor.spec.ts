// create the mock CallHandler for the interceptor

import { createMock } from "@golevelup/ts-jest";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { RequestSanitizerInterceptor } from "./request-sanitizer.interceptor";

describe("RequestSanitizerInterceptor", () => {
	let interceptor: RequestSanitizerInterceptor;
	const mockRequest = createMock<Request>({
		query: {
			test: "test",
			xss: "<option><iframe></select><b><script>alert(1)</script>",
		},
		params: {
			test: "test",
			xss: "<option><iframe></select><b><script>alert(1)</script>",
		},

		body: {
			test: "test",
			xss: "<option><iframe></select><b><script>alert(1)</script>",
			password: "<option><iframe></select><b><script>alert(1)</script>",
		},
	});

	const mockContext = createMock<ExecutionContext>({
		switchToHttp: () => ({
			getRequest: () => ({
				mockRequest,
			}),
		}),
	});

	const mockNext = createMock<CallHandler>();

	beforeEach(() => {
		interceptor = new RequestSanitizerInterceptor();
	});
	it("should be defined", () => {
		expect(interceptor).toBeDefined();
	});

	it("should clean request", () => {
		interceptor.intercept(mockContext, mockNext).subscribe(_result => {
			expect(mockRequest.body.test).toEqual("test");
			expect(mockRequest.query.test).toEqual("test");
			expect(mockRequest.params.test).toEqual("test");

			expect(mockRequest.body.xss).toEqual("<option></option>");
			expect(mockRequest.params.xss).toEqual("<option></option>");
			expect(mockRequest.query.xss).toEqual("<option></option>");
			expect(mockRequest.body.password).toEqual(
				"<option><iframe></select><b><script>alert(1)</script>",
			);
		});
	});
});
