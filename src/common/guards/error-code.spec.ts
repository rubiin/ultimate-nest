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

  const thrownBy = (fn: () => unknown) => {
    try {
      fn();
    } catch (error) {
      return error;
    }
    throw new Error("expected function to throw");
  };

  it("reports a missing authorization header", () => {
    const error = thrownBy(() => guard.canActivate(contextWithHeader(undefined)));

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getResponse()).toMatchObject({
      errorCode: ERROR_CODES.AUTH_TOKEN_MISSING,
    });
  });

  it("reports a malformed token", () => {
    mockJwtService.verify.mockImplementationOnce(() => {
      throw new Error("jwt malformed");
    });

    const error = thrownBy(() => guard.canActivate(contextWithHeader("Bearer nope")));

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getResponse()).toMatchObject({
      errorCode: ERROR_CODES.TOKEN_MALFORMED,
    });
  });
});
