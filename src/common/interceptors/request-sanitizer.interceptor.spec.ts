import { createMock } from "@golevelup/ts-jest";
import { mockRequest } from "@mocks";
import { CallHandler, ExecutionContext } from "@nestjs/common";

import { RequestSanitizerInterceptor } from "./request-sanitizer.interceptor";

describe("RequestSanitizerInterceptor", () => {
	let interceptor: RequestSanitizerInterceptor;

	// create the mock CallHandler for the interceptor
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
