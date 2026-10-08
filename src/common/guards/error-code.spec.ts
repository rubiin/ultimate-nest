import { createMock } from "@golevelup/ts-vitest";
import { mockJwtService } from "@mocks";
import { ERROR_CODES } from "@common/constant";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

import { AuthGuard } from "./auth.guard";

describe("AuthGuard errorCode", () => {
  const guard = new AuthGuard(mockJwtService);

  const contextWithHeader = (authorization?: string) =>
    createMock<ExecutionContext>({
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
    });

  it("reports a missing authorization header", () => {
    expect(() => guard.canActivate(contextWithHeader(undefined))).toThrow(UnauthorizedException);

    try {
      guard.canActivate(contextWithHeader(undefined));
    } catch (error) {
      expect((error as UnauthorizedException).getResponse()).toMatchObject({
        errorCode: ERROR_CODES.AUTH_TOKEN_MISSING,
      });
    }
  });

  it("reports a malformed token", () => {
    mockJwtService.verify.mockImplementationOnce(() => {
      throw new Error("jwt malformed");
    });

    expect(() => guard.canActivate(contextWithHeader("Bearer nope"))).toThrow(
      UnauthorizedException,
    );

    try {
      guard.canActivate(contextWithHeader("Bearer nope"));
    } catch (error) {
      expect((error as UnauthorizedException).getResponse()).toMatchObject({
        errorCode: ERROR_CODES.TOKEN_MALFORMED,
      });
    }
  });
});
