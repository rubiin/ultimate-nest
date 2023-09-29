import { mockContext, mockNext } from "@mocks";
import { ExitInterceptor } from "./app-exit.interceptor";

describe("exitInterceptor", () => {
  let interceptor: ExitInterceptor;

  beforeEach(() => {
    interceptor = new ExitInterceptor();
  });

  describe("intercept", () => {
    it("should pass", () => {
      interceptor.intercept(mockContext, mockNext).subscribe((result) => {
        expect(result).toEqual({});
      });
    });
  });
});
