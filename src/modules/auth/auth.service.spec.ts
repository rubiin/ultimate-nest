import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { of } from "rxjs";

import { TokensService } from "@modules/token/tokens.service";
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
import { MailerService } from "@lib/mailer/mailer.service";
import { OtpLog, Protocol, User } from "@entities";
import { HelperService } from "@common/helpers";
import { AuthService } from "./auth.service";

describe("authService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
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
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should logout", () => {
    const decodedToken = {
      jti: 1,
      sub: 1_234_567_890,
      iat: 1_516_239_022,
      exp: 1_516_239_022,
      aud: "12",
      iss: "12",
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

  it("should reset password", () => {
    mockOtpLogRepo.findOne.mockImplementation(() =>
      Promise.resolve({ ...mockedOtpLog, user: loggedInUser }),
    );

    service.resetPassword(mockResetPasswordDto).subscribe((result) => {
      expect(result).toStrictEqual(loggedInUser);
      expect(mockOtpLogRepo.findOne).toHaveBeenCalledWith({
        otpCode: mockResetPasswordDto.otpCode,
      });
    });
  });

  it("should change password", () => {
    const dto = {
      password: "newPassword",
      confirmPassword: "confirmPassword",
      oldPassword: "oldPassword",
    };

    HelperService.verifyHash = jest.fn().mockImplementation(() => of(true));

    service.changePassword(dto, loggedInUser).subscribe((result) => {
      expect(result).toStrictEqual({ ...loggedInUser, password: dto.password });
      expect(HelperService.verifyHash).toHaveBeenCalled();
    });
  });
});
