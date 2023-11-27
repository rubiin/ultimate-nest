import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { loggedInUser, mockEm, mockRefreshRepo, refreshToken } from "@mocks";
import { RefreshToken } from "@entities";
import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("refreshTokensRepository", () => {
  let service: RefreshTokensRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensRepository,
        { provide: EntityManager, useValue: mockEm },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshRepo },
      ],
    }).compile();

    service = module.get<RefreshTokensRepository>(RefreshTokensRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should find token by id", () => {
    service.findTokenById(12).subscribe((result) => {
      expect(result).toEqual(refreshToken);
      expect(mockRefreshRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockRefreshRepo.findOne).toHaveBeenCalledWith({ id: 12, isRevoked: false });
    });
  });

  it("should create refresh token", () => {
    service.createRefreshToken(loggedInUser, 1000).subscribe((result) => {
      expect(result).toEqual(refreshToken);
      expect(mockEm.persistAndFlush).toHaveBeenCalledTimes(1);
    });
  });

  it("should delete  token", () => {
    service.deleteToken(loggedInUser, 11).subscribe((result) => {
      expect(result).toStrictEqual(true);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledTimes(1);
      expect(mockRefreshRepo.nativeUpdate).toHaveBeenCalledWith(
        { user: loggedInUser, id: 11 },
        { isRevoked: true },
      );
    });
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
