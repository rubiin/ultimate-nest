import { JwtPayload } from "@common/@types";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AuthService } from "../auth.service";
import { JwtStrategy } from "./jwt.strategy";

describe("jwtStrategy", () => {
  const authService = createMock<AuthService>();
  const strategy = new JwtStrategy(
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

  it("accepts an access token", async () => {
    const user = new User({ id: 1 });
    authService.findUser.mockResolvedValue(user);

    await expect(strategy.validate({ ...basePayload, type: "access" })).resolves.toBe(user);
    expect(authService.findUser).toHaveBeenCalledWith(1);
  });

  // Regression: refresh tokens share secret, issuer and audience with access tokens, so a refresh
  // token (even a revoked one) used to authenticate as a bearer token.
  it("rejects a refresh token", async () => {
    await expect(strategy.validate({ ...basePayload, jti: 1, type: "refresh" })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.findUser).not.toHaveBeenCalled();
  });

  it("rejects a token without a type claim", async () => {
    await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
    expect(authService.findUser).not.toHaveBeenCalled();
  });
});
