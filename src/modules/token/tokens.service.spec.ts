import { RefreshToken, User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
  loggedInUser,
  mockConfigService,
  mockEm,
  mockJwtService,
  mockRefreshTokenRepo,
  mockUserRepo,
  refreshToken,
  refreshTokenPayload,
} from "@mocks";
import { TokensService } from "@modules/token/tokens.service";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom, of } from "rxjs";

import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("tokensService", () => {
  let service: TokensService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RefreshTokensRepository, useValue: mockRefreshTokenRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate access token", () => {
    mockJwtService.signAsync.mockResolvedValueOnce("jwt token");
    service.generateAccessToken(loggedInUser).subscribe((result) => {
      expect(result).toStrictEqual("jwt token");
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("should generate refresh token", () => {
    mockJwtService.signAsync.mockResolvedValueOnce("jwtToken");
    mockRefreshTokenRepo.createRefreshToken.mockImplementation(() => of(refreshToken));
    service.generateRefreshToken(loggedInUser, 10_000).subscribe((result) => {
      expect(result).toStrictEqual("jwtToken");
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("should type the access token as access", async () => {
    mockJwtService.signAsync.mockResolvedValueOnce("jwt token");

    await lastValueFrom(service.generateAccessToken(loggedInUser));

    expect(mockJwtService.signAsync.mock.calls[0]![0]).toMatchObject({ type: "access" });
  });

  it("should type the refresh token as refresh", async () => {
    mockJwtService.signAsync.mockResolvedValueOnce("jwt token");
    mockRefreshTokenRepo.createRefreshToken.mockImplementation(() => of(refreshToken));

    await lastValueFrom(service.generateRefreshToken(loggedInUser, 10_000));

    expect(mockJwtService.signAsync.mock.calls[0]![0]).toStrictEqual({ type: "refresh" });
  });

  it("should not rotate when the token was revoked concurrently", async () => {
    vi.spyOn(service, "resolveRefreshToken").mockImplementation(() =>
      of({ token: refreshToken, user: loggedInUser }),
    );
    vi.spyOn(service, "generateAccessToken");
    mockRefreshTokenRepo.revokeToken.mockImplementation(() => of(false));

    await expect(lastValueFrom(service.rotateRefreshToken("refreshToken"))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(service.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should delete all refresh token for user", () => {
    mockRefreshTokenRepo.deleteTokensForUser.mockImplementation(() => of(true));
    service.deleteRefreshTokenForUser(loggedInUser).subscribe((result) => {
      expect(result).toStrictEqual(loggedInUser);
      expect(mockRefreshTokenRepo.deleteTokensForUser).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepo.deleteTokensForUser).toHaveBeenCalledWith(loggedInUser);
    });
  });

  it("should ge refresh token from payload for user", () => {
    mockRefreshTokenRepo.findTokenById.mockImplementation(() => of(refreshToken));
    service.getStoredTokenFromRefreshTokenPayload(refreshTokenPayload).subscribe((result) => {
      expect(result).toStrictEqual(refreshToken);
      expect(mockRefreshTokenRepo.findTokenById).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepo.findTokenById).toHaveBeenCalledWith(refreshTokenPayload.jti);
    });
  });

  it("should get user from refresh token payload", () => {
    service.getUserFromRefreshTokenPayload(refreshTokenPayload).subscribe((result) => {
      expect(result).toEqual(loggedInUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        id: refreshTokenPayload.sub,
      });
    });
  });

  it("should get stored token from refresh token payload", () => {
    service.getUserFromRefreshTokenPayload(refreshTokenPayload).subscribe((result) => {
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(loggedInUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        id: refreshTokenPayload.sub,
      });
    });
  });

  it("should decode refresh token", () => {
    mockJwtService.verifyAsync.mockResolvedValueOnce({
      jti: 1,
      sub: 1,
      type: "refresh",
    });
    service.decodeRefreshToken("refreshTokenPayload").subscribe((result) => {
      expect(result).toStrictEqual({
        jti: 1,
        sub: 1,
        type: "refresh",
      });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith("refreshTokenPayload");
    });
  });

  it.each([
    ["an access token", { jti: 1, sub: 1, type: "access" }],
    ["an untyped token", { jti: 1, sub: 1 }],
  ])("should reject %s as a refresh token", async (_, payload) => {
    mockJwtService.verifyAsync.mockResolvedValueOnce(payload);

    await expect(lastValueFrom(service.decodeRefreshToken("token"))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // Drives real signing and verification against an in-memory token store, so the whole
  // refresh flow (type claim, revocation, reissue) is exercised rather than mocked out.
  describe("rotateRefreshToken", () => {
    let tokens: TokensService;
    let store: Map<number, { id: number; isRevoked: boolean }>;

    beforeEach(() => {
      store = new Map();
      const repo = {
        createRefreshToken: () => {
          const token = { id: store.size + 1, isRevoked: false };
          store.set(token.id, token);
          return of(token as unknown as RefreshToken);
        },
        // `jti` is signed as a string, so the lookup id arrives as one.
        findTokenById: (id: number | string) => {
          const token = store.get(Number(id));
          return of(token && !token.isRevoked ? (token as unknown as RefreshToken) : null);
        },
        revokeToken: (id: number) => {
          const token = store.get(id);
          if (!token || token.isRevoked) return of(false);
          token.isRevoked = true;
          return of(true);
        },
      };
      const userRepo = { findOneOrFail: async () => loggedInUser };
      const config = { get: () => 3600 };

      tokens = new TokensService(
        userRepo as never,
        repo as never,
        new JwtService({ secret: "test-secret" }),
        config as never,
      );
    });

    it("returns a new access and refresh token and revokes the old one", async () => {
      const old = await lastValueFrom(tokens.generateRefreshToken(loggedInUser, 3600));

      const result = await lastValueFrom(tokens.rotateRefreshToken(old));

      expect(result.user).toBe(loggedInUser);
      expect(result.refreshToken).not.toBe(old);
      const jwt = new JwtService({ secret: "test-secret" });
      expect(jwt.decode(result.accessToken)).toMatchObject({ type: "access" });
      expect(jwt.decode(result.refreshToken)).toMatchObject({ jti: "2", type: "refresh" });
      expect(store.get(1)!.isRevoked).toBe(true);
      expect(store.get(2)!.isRevoked).toBe(false);
    });

    it("rejects reuse of a rotated refresh token", async () => {
      const old = await lastValueFrom(tokens.generateRefreshToken(loggedInUser, 3600));
      await lastValueFrom(tokens.rotateRefreshToken(old));

      await expect(lastValueFrom(tokens.rotateRefreshToken(old))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects an access token", async () => {
      const access = await lastValueFrom(tokens.generateAccessToken(loggedInUser));

      await expect(lastValueFrom(tokens.rotateRefreshToken(access))).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
