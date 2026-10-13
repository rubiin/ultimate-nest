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

  describe("password reset", () => {
    it("should reset the password from an otp", () => {
      const dto = { otp: "123456", password: "New@1234" } as never;
      authService.resetPassword.mockReturnValue(of({} as never));

      controller.resetUserPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });

    it("should send a reset otp", () => {
      const dto = { email: "a@example.com" } as never;
      authService.forgotPassword.mockReturnValue(of({ message: "sent" }));

      controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    });

    it("should verify a signup otp", () => {
      const dto = { code: "123456" } as never;
      authService.verifyOtp.mockReturnValue(of({} as never));

      controller.verifyOtp(dto);

      expect(authService.verifyOtp).toHaveBeenCalledWith(dto);
    });

    it("should change the password of the logged-in user", () => {
      const dto = { newPassword: "n", oldPassword: "o", password: "n" } as never;
      const user = new User({ id: 1 });
      authService.changePassword.mockReturnValue(of({} as never));

      controller.changePassword(dto, user);

      expect(authService.changePassword).toHaveBeenCalledWith(dto, user);
    });
  });

  describe("oauth", () => {
    it.each(["googleAuthRedirect", "facebookAuthRedirect"] as const)(
      "should hand the oauth profile to the service from %s",
      (handler) => {
        const response = { redirect: vi.fn<() => void>() } as unknown as NestifyResponse;
        const user = { email: "a@example.com" } as never;
        authService.OauthHandler.mockReturnValue(of(undefined as never));

        controller[handler](user, response, client);

        expect(authService.OauthHandler).toHaveBeenCalledWith({ client, response, user });
      },
    );

    it.each(["googleAuth", "facebookAuth"] as const)(
      "%s is a no-op because passport handles the redirect",
      (handler) => {
        expect(controller[handler]({} as never)).toBeUndefined();
      },
    );

    // Stands in for the frontend callback route the oauth redirect points at.
    it("should echo the token for the mock oauth callback", () => {
      expect(controller.oauthMock({ token: "a-token" })).toEqual({
        message: "successfully logged",
        token: "a-token",
      });
    });
  });
});
