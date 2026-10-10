import { createMock } from "@golevelup/ts-vitest";
import { mockReflector } from "@mocks";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

import { JwtAuthGuard } from "./jwt.guard";

describe("jwtAuthGuard", () => {
  let authenticatedGuard: JwtAuthGuard;

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
    authenticatedGuard = new JwtAuthGuard(mockReflector);
  });

  it("should be defined", () => {
    expect(authenticatedGuard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true for public", () => {
      mockReflector.get.mockImplementationOnce(() => {
        return true;
      });
      expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
    });
  });

  // Passport calls back with `info === undefined` on success and `user === false` on failure, so
  // a strict `!== null` / `=== null` check rejects every valid token and misses failed lookups.
  describe("handleRequest", () => {
    it("returns the user when passport reports success", () => {
      const user = { id: 1 };

      expect(authenticatedGuard.handleRequest(null, user, undefined as never)).toBe(user);
    });

    it("rejects when passport reports no user", () => {
      expect(() => authenticatedGuard.handleRequest(null, false, undefined as never)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
