import { TimeoutInterceptor } from "./timeout.interceptor";

// create the mock CallHandler for the interceptor

describe("TimeoutInterceptor", () => {
	let interceptor: TimeoutInterceptor;

	beforeEach(() => {
		interceptor = new TimeoutInterceptor();
	});
	it("should be defined", () => {
		expect(interceptor).toBeDefined();
	});
});
