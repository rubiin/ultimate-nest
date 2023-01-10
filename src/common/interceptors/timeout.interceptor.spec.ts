import { createMock } from "@golevelup/ts-jest";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

import { TimeoutInterceptor } from "./timeout.interceptor";

describe("TimeoutInterceptor", () => {
	let interceptor: TimeoutInterceptor;

	const mockNext = createMock<CallHandler>({
		handle: jest.fn(() => of({})),
	});

	const mockContext = createMock<ExecutionContext>({});

	beforeEach(() => {
		interceptor = new TimeoutInterceptor();
	});

	describe("intercept", () => {
		it("should pass", () => {
			interceptor.intercept(mockContext, mockNext).subscribe(result => {
				expect(result).toEqual({});
			});
		});
	});
});
