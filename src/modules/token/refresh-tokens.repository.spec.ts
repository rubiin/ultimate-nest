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
    mockRefreshRepo.nativeUpdate.mockResolvedValueOnce(1);

    await expect(lastValueFrom(service.revokeToken(11))).resolves.toBe(true);
    expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledWith(
      { id: 11, isRevoked: false },
      { isRevoked: true },
    );
  });

  it("should report a token that was already revoked", async () => {
    mockRefreshRepo.nativeUpdate.mockResolvedValueOnce(0);

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
