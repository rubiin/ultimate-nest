import { JwtPayload } from "@common/@types";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AuthService } from "../auth.service";
import { JwtTwofaStrategy } from "./jwt-2fa.strategy";

describe("jwtTwofaStrategy", () => {
  const authService = createMock<AuthService>();
  const strategy = new JwtTwofaStrategy(
    authService,
    createMock<ConfigService<Configs, true>>({ get: () => "test-secret" as never }),
  );

  const basePayload: JwtPayload = {
    aud: "nestify",
    exp: 1,
    iat: 1,
    iss: "nestify",
    sub: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a partial 2fa token", async () => {
    const user = new User({ id: 1 });
    authService.findUser.mockResolvedValue(user);

    await expect(strategy.validate({ ...basePayload, type: "2fa" })).resolves.toBe(user);
    expect(authService.findUser).toHaveBeenCalledWith({ id: 1 });
  });

  // Regression: the strategy accepted any token signed with the secret, so a refresh token could
  // be traded for a fresh pair at /2fa/authenticate.
  it.each([
    ["an access token", "access"],
    ["a refresh token", "refresh"],
    ["an untyped token", undefined],
  ] as const)("rejects %s", async (_label, type) => {
    await expect(strategy.validate({ ...basePayload, type })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.findUser).not.toHaveBeenCalled();
  });
});
