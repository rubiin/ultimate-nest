import { createMock } from "@golevelup/ts-jest";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { ExitInterceptor } from "./app-exit.interceptor";

describe("ExitInterceptor", () => {
	let interceptor: ExitInterceptor;

	const mockNext = createMock<CallHandler>({
		handle: jest.fn(() => of({})),
	});

	const mockContext = createMock<ExecutionContext>({});

	beforeEach(() => {
		interceptor = new ExitInterceptor();
	});

	describe("intercept", () => {
		it("should pass", () => {
			interceptor.intercept(mockContext, mockNext).subscribe(res => {
				expect(res).toEqual({});
			});
		});
	});
});
