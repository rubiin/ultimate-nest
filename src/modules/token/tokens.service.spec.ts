import { User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import {
	loggedInUser,
	mockEm,
	mockJwtService,
	mockRefreshTokenRepo,
	mockUserRepo,
	refreshToken,
	refreshTokenPayload,
} from "@mocks";
import { TokensService } from "@modules/token/tokens.service";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";

import { RefreshTokensRepository } from "./refresh-tokens.repository";

describe("TokensService", () => {
	let service: TokensService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TokensService,
				{ provide: EntityManager, useValue: mockEm },

				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: RefreshTokensRepository, useValue: mockRefreshTokenRepo },
			],
		}).compile();

		service = module.get<TokensService>(TokensService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should generate access token", () => {
		mockJwtService.signAsync.mockResolvedValueOnce("jwt token");
		service.generateAccessToken(loggedInUser).subscribe(result => {
			expect(result).toStrictEqual("jwt token");
			expect(mockJwtService.signAsync).toBeCalledTimes(1);
		});
	});

	it("should generate refresh token", () => {
		mockJwtService.signAsync.mockResolvedValueOnce("jwtToken");
		mockRefreshTokenRepo.createRefreshToken.mockImplementation(() => of(refreshToken));
		service.generateRefreshToken(loggedInUser, 10_000).subscribe(result => {
			expect(result).toStrictEqual("jwtToken");
			expect(mockJwtService.signAsync).toBeCalledTimes(1);
		});
	});

	it("should create access token from refresh token", () => {
		jest.spyOn(service, "resolveRefreshToken").mockImplementation(() =>
			of({ user: loggedInUser, token: refreshToken }),
		);
		jest.spyOn(service, "generateAccessToken").mockImplementation(() => of("refreshToken"));
		service.createAccessTokenFromRefreshToken("refreshToken").subscribe(result => {
			expect(result).toStrictEqual({ token: "refreshToken", user: loggedInUser });
			expect(service.resolveRefreshToken).toBeCalledTimes(1);
			expect(service.generateAccessToken).toBeCalledTimes(1);
		});
	});

	it("should delete all refresh token for user", () => {
		mockRefreshTokenRepo.deleteTokensForUser.mockImplementation(() => of(true));
		service.deleteRefreshTokenForUser(loggedInUser).subscribe(result => {
			expect(result).toStrictEqual(loggedInUser);
			expect(mockRefreshTokenRepo.deleteTokensForUser).toBeCalledTimes(1);
			expect(mockRefreshTokenRepo.deleteTokensForUser).toBeCalledWith(loggedInUser);
		});
	});

	it("should delete all refresh token for user", () => {
		mockRefreshTokenRepo.findTokenById.mockImplementation(() => of(refreshToken));
		service.getStoredTokenFromRefreshTokenPayload(refreshTokenPayload).subscribe(result => {
			expect(result).toStrictEqual(refreshToken);
			expect(mockRefreshTokenRepo.findTokenById).toBeCalledTimes(1);
			expect(mockRefreshTokenRepo.findTokenById).toBeCalledWith(refreshTokenPayload.jti);
		});
	});

	it("should get user from refresh token payload", () => {
		service.getUserFromRefreshTokenPayload(refreshTokenPayload).subscribe(result => {
			expect(result).toEqual(loggedInUser);
			expect(mockUserRepo.findOne).toBeCalledTimes(1);
			expect(mockUserRepo.findOne).toBeCalledWith({
				id: refreshTokenPayload.sub,
			});
		});
	});

	it("should get stored token from refresh token payload", () => {
		service.getUserFromRefreshTokenPayload(refreshTokenPayload).subscribe(result => {
			expect(mockUserRepo.findOne).toBeCalledTimes(1);
			expect(result).toEqual(loggedInUser);
			expect(mockUserRepo.findOne).toBeCalledWith({
				id: refreshTokenPayload.sub,
			});
		});
	});

	it("should decode refresh token", () => {
		mockJwtService.verifyAsync.mockResolvedValueOnce({
			jti: 1,
			sub: 1,
		});
		service.decodeRefreshToken("refreshTokenPayload").subscribe(result => {
			expect(result).toStrictEqual({
				jti: 1,
				sub: 1,
			});
			expect(mockJwtService.verifyAsync).toBeCalledTimes(1);
			expect(mockJwtService.verifyAsync).toBeCalledWith("refreshTokenPayload");
		});
	});
});
