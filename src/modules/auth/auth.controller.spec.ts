import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { TokensService } from "@modules/token/tokens.service";
import { BadRequestException } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  const client = { ipAddress: "203.0.113.7", userAgent: "Firefox" };
  const authService = createMock<AuthService>();
  const tokenService = createMock<TokensService>();
  const controller = new AuthController(authService, tokenService);

  // Regression: the route called `login(dto)`, whose `isPasswordLogin` defaults to false, so any
  // password logged in.
  it("should log in with a password check", () => {
    const dto = { email: "test@example.com", password: "Password@1234" };
    authService.login.mockReturnValue(of({} as never));

    controller.login(dto, client);

    expect(authService.login).toHaveBeenCalledWith(dto, true, client);
  });

  it("should return the rotated token pair in the login response shape", async () => {
    const user = new User({ id: 1, idx: "some-idx" });
    tokenService.rotateRefreshToken.mockReturnValue(
      of({ accessToken: "new-access", refreshToken: "new-refresh", user }),
    );

    const result = await lastValueFrom(controller.refresh({ refreshToken: "old-refresh" }, client));

    expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith("old-refresh", client);
    expect(result).toStrictEqual({
      accessToken: "new-access",
      refresh_token: "new-refresh",
      user: { id: 1, idx: "some-idx" },
    });
  });

  describe("sessions", () => {
    const user = new User({ id: 1, idx: "some-idx" });

    it("should list active sessions without leaking internal ids", async () => {
      tokenService.listSessions.mockReturnValue(
        of([
          {
            createdAt: new Date("2026-01-01"),
            expiresIn: new Date("2026-02-01"),
            id: 5,
            idx: "session-idx",
            ipAddress: "203.0.113.7",
            userAgent: "Firefox",
            user,
          },
        ] as never),
      );

      const result = await lastValueFrom(controller.sessions(user));

      expect(result).toStrictEqual([
        {
          createdAt: new Date("2026-01-01"),
          expiresIn: new Date("2026-02-01"),
          id: "session-idx",
          ipAddress: "203.0.113.7",
          userAgent: "Firefox",
        },
      ]);
    });

    it("should revoke one session", async () => {
      tokenService.revokeSession.mockReturnValue(of(undefined));

      await lastValueFrom(controller.revokeSession(user, "session-idx"));

      expect(tokenService.revokeSession).toHaveBeenCalledWith(user, "session-idx");
    });

    it("should revoke every session", async () => {
      authService.logoutFromAll.mockReturnValue(of(user as never));

      await lastValueFrom(controller.revokeAllSessions(user));

      expect(authService.logoutFromAll).toHaveBeenCalledWith(user);
    });
  });

  describe("logout", () => {
    const user = new User({ id: 1, idx: "some-idx" });

    it("should revoke every token when fromAll is set", () => {
      authService.logoutFromAll.mockReturnValue(of(user as never));

      controller.logout(user, true);

      expect(authService.logoutFromAll).toHaveBeenCalledWith(user);
    });

    it("should revoke the given refresh token", () => {
      authService.logout.mockReturnValue(of(user as never));

      controller.logout(user, false, { refreshToken: "a-token" } as never);

      expect(authService.logout).toHaveBeenCalledWith(user, "a-token");
    });

    // Regression: the body was dereferenced with `!`, so posting no body produced a 500
    // instead of a 400.
    it("should reject a missing body with a bad request", () => {
      expect(() => controller.logout(user, false)).toThrow(BadRequestException);
      expect(() => controller.logout(user, false, {} as never)).toThrow(BadRequestException);
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });
});
