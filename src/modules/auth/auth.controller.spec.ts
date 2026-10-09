import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { TokensService } from "@modules/token/tokens.service";
import { lastValueFrom, of } from "rxjs";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  const authService = createMock<AuthService>();
  const tokenService = createMock<TokensService>();
  const controller = new AuthController(authService, tokenService);

  // Regression: the route called `login(dto)`, whose `isPasswordLogin` defaults to false, so any
  // password logged in.
  it("should log in with a password check", () => {
    const dto = { email: "test@example.com", password: "Password@1234" };
    authService.login.mockReturnValue(of({} as never));

    controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto, true);
  });

  it("should return the rotated token pair in the login response shape", async () => {
    const user = new User({ id: 1, idx: "some-idx" });
    tokenService.rotateRefreshToken.mockReturnValue(
      of({ accessToken: "new-access", refreshToken: "new-refresh", user }),
    );

    const result = await lastValueFrom(controller.refresh({ refreshToken: "old-refresh" }));

    expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith("old-refresh");
    expect(result).toStrictEqual({
      accessToken: "new-access",
      refresh_token: "new-refresh",
      user: { id: 1, idx: "some-idx" },
    });
  });
});
