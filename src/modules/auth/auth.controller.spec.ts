import { createMock } from "@golevelup/ts-vitest";
import { TokensService } from "@modules/token/tokens.service";
import { of } from "rxjs";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  const authService = createMock<AuthService>();
  const controller = new AuthController(authService, createMock<TokensService>());

  // Regression: the route called `login(dto)`, whose `isPasswordLogin` defaults to false, so any
  // password logged in.
  it("should log in with a password check", () => {
    const dto = { email: "test@example.com", password: "Password@1234" };
    authService.login.mockReturnValue(of({} as never));

    controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto, true);
  });
});
