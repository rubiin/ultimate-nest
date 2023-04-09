import { RefreshToken } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { EntityRepository } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { loggedInUser, refreshToken } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("RefreshTokensRepository", () => {
	let service: RefreshTokensRepository;
	const mockRefreshRepo = createMock<EntityRepository<RefreshToken>>();

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RefreshTokensRepository,
				{ provide: getRepositoryToken(RefreshToken), useValue: mockRefreshRepo },
			],
		}).compile();

		service = module.get<RefreshTokensRepository>(RefreshTokensRepository);
	});

	// defining mocks

	mockRefreshRepo.findOne.mockImplementation(() =>
		Promise.resolve({
			...refreshToken,
		} as any),
	);

	mockRefreshRepo.nativeUpdate.mockResolvedValueOnce(1);

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
			expect(mockRefreshRepo.persistAndFlush).toBeCalledTimes(1);
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
