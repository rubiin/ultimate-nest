import { mockContext, mockNext } from "@mocks";
import { TimeoutInterceptor } from "./timeout.interceptor";

describe("timeoutInterceptor", () => {
  let interceptor: TimeoutInterceptor;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();
  });

  describe("intercept", () => {
    it("should pass", () => {
      interceptor.intercept(mockContext, mockNext).subscribe((result) => {
        expect(result).toEqual({});
      });
    });
  });
});
