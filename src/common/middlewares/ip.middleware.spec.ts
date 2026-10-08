import { mockRequest, mockResponse } from "@mocks";
import * as realIp from "@supercharge/request-ip";

import { RealIpMiddleware } from "./ip.middleware";

describe("realIpMiddleware", () => {
  let middleware: RealIpMiddleware;

  beforeEach(() => {
    middleware = new RealIpMiddleware();
  });
  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  describe("use", () => {
    it("should return real ip", () => {
      vi.spyOn(realIp, "getClientIp").mockReturnValue("192.168.1.1");

      const mockNext = vi.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(realIp.getClientIp).toHaveBeenCalled();
      expect(mockRequest.realIp).toBe("192.168.1.1");
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
