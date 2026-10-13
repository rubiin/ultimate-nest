import { createMock } from "@golevelup/ts-vitest";
import { mockReflector } from "@mocks";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { JwtAuthGuard } from "./jwt.guard";

describe("jwtAuthGuard", () => {
  const originalNodeEnv = process.env.NODE_ENV;

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

    it("should defer to passport for a protected route", () => {
      // createMock returns a mock function for un-stubbed calls, which is truthy and would
      // short-circuit the guard as "public".
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      // `AuthGuard("jwt")` returns an anonymous mixin, so the parent is only reachable
      // through the prototype chain.
      const mixin = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
        canActivate: (context: unknown) => unknown;
      };
      const spy = vi.spyOn(mixin, "canActivate").mockReturnValue(true);

      expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
      expect(spy).toHaveBeenCalledWith(mockContext);

      spy.mockRestore();
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

    it("reports an expired token as forbidden so the client knows to refresh", () => {
      const info = new TokenExpiredError("jwt expired");

      expect(() => authenticatedGuard.handleRequest(null, false, info)).toThrow(ForbiddenException);
    });

    it("reports a malformed token as unauthorized", () => {
      const info = new JsonWebTokenError("jwt malformed");

      expect(() => authenticatedGuard.handleRequest(null, false, info)).toThrow(
        UnauthorizedException,
      );
    });

    it("surfaces the passport error message when there is no info object", () => {
      expect(() =>
        authenticatedGuard.handleRequest(new Error("no secret"), false, undefined as never),
      ).toThrow(UnauthorizedException);
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });
});
