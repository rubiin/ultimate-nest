import { createMock } from "@golevelup/ts-vitest";
import { mockJwtService } from "@mocks";
import { ExecutionContext } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

import { AuthGuard } from "./auth.guard";

describe("authenticatedGuard", () => {
  let authenticatedGuard: AuthGuard;
  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: "Bearer token",
        },
      }),
    }),
  });

  beforeEach(() => {
    authenticatedGuard = new AuthGuard(mockJwtService);
  });

  it("should be defined", () => {
    expect(authenticatedGuard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return authorization", () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        return { idx: "idx" };
      });
      expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
    });

    it("should throw error when invalid token", () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      expect(() => authenticatedGuard.canActivate(mockContext)).toThrow(HttpException);
    });
  });
});
