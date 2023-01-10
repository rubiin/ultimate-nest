import { BaseRepository } from "@common/database/base.repository";
import { RefreshToken, User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedUser } from "@mocks";
import { TokensService } from "@modules/token/tokens.service";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { of } from "rxjs";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
describe("TokensService", () => {
	let service: TokensService;

	const mockI18n = createMock<I18nService>();
	const mockUserRepo = createMock<BaseRepository<User>>();
	const mockJwtService = createMock<JwtService>();
	const mockRefreshRepo = createMock<RefreshTokensRepository>();

	const loggedInUser = new User(mockedUser);

	const refreshToken = new RefreshToken({
		user: loggedInUser,
		expiresIn: new Date(),
		isRevoked: false,
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TokensService,

				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},

				{ provide: I18nService, useValue: mockI18n },
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: RefreshTokensRepository, useValue: mockRefreshRepo },
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
		mockJwtService.signAsync.mockResolvedValueOnce("jwt token");
		mockRefreshRepo.createRefreshToken.mockImplementation(() => of(refreshToken));
		service.generateRefreshToken(loggedInUser, 10000).subscribe(result => {
			expect(result).toStrictEqual("jwt token");
			expect(mockJwtService.signAsync).toBeCalledTimes(1);
		});
	});

	it("should create access token from refresh token", () => {
		jest.spyOn(service, "resolveRefreshToken").mockImplementation(() =>
			of({ user: loggedInUser, token: refreshToken }),
		);
		jest.spyOn(service, "generateAccessToken").mockImplementation(() => of("refresh token"));
		service.createAccessTokenFromRefreshToken("refresh token").subscribe(result => {
			expect(result).toStrictEqual({ token: "refresh token", user: loggedInUser });
			expect(service.resolveRefreshToken).toBeCalledTimes(1);
			expect(service.generateAccessToken).toBeCalledTimes(1);
		});
	});

	it("should delete refresh token for user", () => {
		mockRefreshRepo.deleteTokensForUser.mockImplementation(() => of(true));
		service.deleteRefreshTokenForUser(loggedInUser).subscribe(result => {
			expect(result).toStrictEqual(loggedInUser);
			expect(mockRefreshRepo.deleteTokensForUser).toBeCalledTimes(1);
		});
	});
});
