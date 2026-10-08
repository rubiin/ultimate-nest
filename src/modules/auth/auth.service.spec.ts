import { HelperService } from "@common/helpers";
import { OtpLog, Protocol, User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
  loggedInUser,
  mockConfigService,
  mockEm,
  mockMailService,
  mockOtpLogRepo,
  mockResetPasswordDto,
  mockTokenService,
  mockUserRepo,
  mockedOtpLog,
  mockedProtocol,
} from "@mocks";
import { TokensService } from "@modules/token/tokens.service";
import { ConfigService } from "@nestjs/config";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom, of } from "rxjs";

import { AuthService } from "./auth.service";

describe("authService", () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEm.flush.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(OtpLog),
          useValue: mockOtpLogRepo,
        },
        {
          provide: getRepositoryToken(Protocol),
          useValue: mockedProtocol,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailerService, useValue: mockMailService },
        { provide: TokensService, useValue: mockTokenService },
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should logout", () => {
    const decodedToken = {
      aud: "12",
      exp: 1_516_239_022,
      iat: 1_516_239_022,
      iss: "12",
      jti: 1,
      sub: 1_234_567_890,
    };

    mockTokenService.decodeRefreshToken.mockImplementation(() => of(decodedToken));

    mockTokenService.deleteRefreshToken.mockImplementation(() => of(loggedInUser));

    service.logout(loggedInUser, "refreshToken").subscribe((result) => {
      expect(result).toStrictEqual(loggedInUser);
      expect(mockTokenService.decodeRefreshToken).toHaveBeenCalledWith("refreshToken");
      expect(mockTokenService.deleteRefreshToken).toHaveBeenCalledWith(loggedInUser, decodedToken);
    });
  });

  it("should logout from all", () => {
    mockTokenService.deleteRefreshTokenForUser.mockImplementation(() => of(loggedInUser));

    service.logoutFromAll(loggedInUser).subscribe((result) => {
      expect(result).toStrictEqual(loggedInUser);
      expect(mockTokenService.deleteRefreshTokenForUser).toHaveBeenCalledWith(loggedInUser);
    });
  });

  it("should reset password", async () => {
    mockOtpLogRepo.findOne.mockImplementation(async () =>
      Promise.resolve({
        ...mockedOtpLog,
        user: { getEntity: () => loggedInUser },
      }),
    );

    const result = await lastValueFrom(service.resetPassword(mockResetPasswordDto));

    expect(result).toStrictEqual(loggedInUser);
    expect(mockOtpLogRepo.findOne).toHaveBeenCalledWith(
      { otpCode: mockResetPasswordDto.otpCode },
      { populate: ["user"] },
    );
  });

  it("should change password", async () => {
    const dto = {
      confirmPassword: "confirmPassword",
      oldPassword: "oldPassword",
      password: "newPassword",
    };

    mockUserRepo.findOne.mockImplementation(async () => Promise.resolve(loggedInUser));
    HelperService.verifyHash = vi.fn().mockImplementation(() => of(true));

    const result = await lastValueFrom(service.changePassword(dto, loggedInUser));

    expect(result.idx).toBe(loggedInUser.idx);
    expect(result.password).toBe(dto.password);
    expect(HelperService.verifyHash).toHaveBeenCalled();
  });
});
