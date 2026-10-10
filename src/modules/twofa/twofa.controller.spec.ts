import { JwtAuthGuard } from "@common/guards";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { AuthService } from "@modules/auth/auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { AuthGuard } from "@nestjs/passport";
import { lastValueFrom, of } from "rxjs";

import { TwoFactorController } from "./twofa.controller";
import { TwoFactorService } from "./twofa.service";

describe("twoFactorController", () => {
  const twoFactorService = createMock<TwoFactorService>();
  const authService = createMock<AuthService>();
  const controller = new TwoFactorController(twoFactorService, authService);
  const user = new User({ id: 1, idx: "user-1", isTwoFactorEnabled: true });

  const guardsOf = (handler: keyof TwoFactorController) =>
    Reflect.getMetadata(GUARDS_METADATA, TwoFactorController.prototype[handler]) as unknown[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Regression: `login(user, true)` ran the password check without a password and always failed.
  it("should issue the full pair for a valid code without a password login", async () => {
    const pair = {
      accessToken: "access",
      refresh_token: "refresh",
      user: { id: 1, idx: "user-1" },
    };
    twoFactorService.isTwoFactorCodeValid.mockReturnValue(of(true));
    authService.issueTokens.mockReturnValue(of(pair));

    await expect(lastValueFrom(controller.authenticate(user, { code: "123456" }))).resolves.toBe(
      pair,
    );
    expect(twoFactorService.isTwoFactorCodeValid).toHaveBeenCalledWith("123456", user);
    expect(authService.issueTokens).toHaveBeenCalledWith(user);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("should reject an invalid code with 401", async () => {
    twoFactorService.isTwoFactorCodeValid.mockReturnValue(of(false));

    await expect(
      lastValueFrom(controller.authenticate(user, { code: "000000" })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authService.issueTokens).not.toHaveBeenCalled();
  });

  // Setup routes go through JwtStrategy (access tokens only), so a partial 2fa token cannot set up
  // or replace the second factor.
  it.each(["register", "turnOnTwoFactorAuthentication"] as const)(
    "should guard %s with the access-token guard",
    (handler) => {
      expect(guardsOf(handler)).toContain(JwtAuthGuard);
    },
  );

  it("should guard authenticate with the jwt2fa strategy only", () => {
    const guards = guardsOf("authenticate");

    expect(guards).toStrictEqual([AuthGuard("jwt2fa")]);
  });
});
