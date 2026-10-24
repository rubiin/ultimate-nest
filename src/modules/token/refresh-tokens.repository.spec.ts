import { MS_PER_SECOND } from "@common/constant";
import { RefreshToken } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loggedInUser, mockEm, mockRefreshRepo, refreshToken } from "@mocks";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom } from "rxjs";

import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("refreshTokensRepository", () => {
  let service: RefreshTokensRepository;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensRepository,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshRepo },
      ],
    }).compile();

    service = module.get<RefreshTokensRepository>(RefreshTokensRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should find token by id", async () => {
    mockRefreshRepo.findOne.mockResolvedValue(refreshToken);

    const result = await lastValueFrom(service.findTokenById(12));

    expect(result).toEqual(refreshToken);
    expect(mockRefreshRepo.findOne).toHaveBeenCalledTimes(1);
    expect(mockRefreshRepo.findOne).toHaveBeenCalledWith({ id: 12, isRevoked: false });
  });

  // Regression: `findOneOrFail` turned a revoked token into a 404 before `TokensService` could
  // answer 401 for it.
  it("should resolve to null for a revoked or missing token", async () => {
    mockRefreshRepo.findOne.mockResolvedValue(null);

    await expect(lastValueFrom(service.findTokenById(12))).resolves.toBeNull();
  });

  it("should create refresh token", () => {
    service.createRefreshToken(loggedInUser, 1000).subscribe((result) => {
      expect(result).toEqual(refreshToken);
      expect(mockEm.persist).toHaveBeenCalledTimes(1);
    });
  });

  // Regression: the config hands `JWT_REFRESH_EXPIRY` through as `7d`, which multiplied to NaN.
  it("should accept a duration string for the ttl", async () => {
    mockRefreshRepo.create.mockImplementation(((data: { expiresIn: Date }) => data) as never);
    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);

    const before = Date.now();
    const result = await lastValueFrom(service.createRefreshToken(loggedInUser, "7d"));

    expect(result.expiresIn.getTime() - before).toBe(7 * 24 * 60 * 60 * MS_PER_SECOND);
    expect(Number.isNaN(result.expiresIn.getTime())).toBe(false);
  });

  it("should record the caller's ip and a truncated user agent on the token", async () => {
    mockRefreshRepo.create.mockImplementation(((data: object) => data) as never);
    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);

    await lastValueFrom(
      service.createRefreshToken(loggedInUser, 1000, {
        ipAddress: "203.0.113.7",
        userAgent: "x".repeat(600),
      }),
    );

    expect(mockRefreshRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: "203.0.113.7", userAgent: "x".repeat(512) }),
    );
  });

  it("should list only unexpired, unrevoked tokens of the user, newest first", async () => {
    mockRefreshRepo.find.mockResolvedValue([refreshToken] as never);

    const result = await lastValueFrom(service.findActiveTokensForUser(loggedInUser));

    expect(result).toStrictEqual([refreshToken]);
    expect(mockRefreshRepo.find).toHaveBeenCalledWith(
      { expiresIn: { $gt: expect.any(Date) }, isRevoked: false, user: loggedInUser },
      { orderBy: { createdAt: "desc" } },
    );
  });

  it("should only revoke an active token owned by the user", async () => {
    mockRefreshRepo.nativeUpdate.mockReset().mockResolvedValue(0 as never);

    await expect(lastValueFrom(service.revokeUserToken(loggedInUser, "idx-1"))).resolves.toBe(
      false,
    );
    expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledWith(
      { idx: "idx-1", isRevoked: false, user: loggedInUser },
      { isRevoked: true },
    );
  });

  it("should delete  token", () => {
    service.deleteToken(loggedInUser, 11).subscribe((result) => {
      expect(result).toStrictEqual(true);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledTimes(1);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledWith(
        { id: 11, user: loggedInUser },
        { isRevoked: true },
      );
    });
  });

  it("should revoke an active token", async () => {
    mockEm.nativeUpdate.mockResolvedValueOnce(1);

    await expect(lastValueFrom(service.revokeToken(11))).resolves.toBe(true);
    expect(mockEm.nativeUpdate).toHaveBeenCalledWith(
      RefreshToken,
      { id: 11, isRevoked: false },
      { isRevoked: true },
    );
  });

  it("should report a token that was already revoked", async () => {
    mockEm.nativeUpdate.mockResolvedValueOnce(0);

    await expect(lastValueFrom(service.revokeToken(11))).resolves.toBe(false);
  });

  it("should delete all token for user", () => {
    service.deleteTokensForUser(loggedInUser).subscribe((result) => {
      expect(result).toStrictEqual(true);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledTimes(1);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledWith(
        { user: loggedInUser },
        { isRevoked: true },
      );
    });
  });
});
