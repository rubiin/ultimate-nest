import { RefreshToken } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { loggedInUser, mockEm, mockRefreshRepo, refreshToken } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("RefreshTokensRepository", () => {
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
		service.findTokenById(12).subscribe(result => {
			expect(result).toEqual(refreshToken);
			expect(mockRefreshRepo.findOne).toBeCalledTimes(1);
			expect(mockRefreshRepo.findOne).toBeCalledWith({ id: 12, isRevoked: false });
		});
	});

	it("should create refresh token", () => {
		service.createRefreshToken(loggedInUser, 1000).subscribe(result => {
			expect(result).toEqual(refreshToken);
			expect(mockEm.persistAndFlush).toBeCalledTimes(1);
		});
	});

	it("should delete  token", () => {
		service.deleteToken(loggedInUser, 11).subscribe(result => {
			expect(result).toStrictEqual(true);
			expect(mockRefreshRepo.nativeUpdate).toBeCalledTimes(1);
			expect(mockRefreshRepo.nativeUpdate).toBeCalledWith(
				{ user: loggedInUser, id: 11 },
				{ isRevoked: true },
			);
		});
	});

	it("should delete all token for user", () => {
		service.deleteTokensForUser(loggedInUser).subscribe(result => {
			expect(result).toStrictEqual(true);
			expect(mockRefreshRepo.nativeUpdate).toBeCalledTimes(1);
			expect(mockRefreshRepo.nativeUpdate).toBeCalledWith(
				{ user: loggedInUser },
				{ isRevoked: true },
			);
		});
	});
});
