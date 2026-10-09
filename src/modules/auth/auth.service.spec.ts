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
  mockProtocolRepo,
  mockResetPasswordDto,
  mockTokenService,
  mockUserRepo,
  mockedOtpLog,
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
          useValue: mockProtocolRepo,
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

  it("should set otp expiry from the protocol in minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () =>
      Promise.resolve({ otpExpiryInMinutes: 5 })) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    mockMailService.sendMail.mockReturnValue(of(undefined) as never);
    mockEm.transactional.mockImplementation((async (cb: (em: unknown) => Promise<unknown>) =>
      cb(mockEm)) as never);

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    // `otpExpiryInMinutes` is minutes and `Date.now()` is milliseconds, so the
    // column has to be scaled before it is added. Asserting the absolute date
    // catches both a missing multiplication and one applied to the wrong term.
    const { expiresIn } = mockOtpLogRepo.create.mock.calls[0]![0] as { expiresIn: Date };
    expect(expiresIn.getTime() - Date.now()).toBe(5 * 60_000);

    vi.useRealTimers();
  });

  it("should default otp expiry to five minutes when no protocol exists", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () => Promise.resolve(null)) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    mockMailService.sendMail.mockReturnValue(of(undefined) as never);
    mockEm.transactional.mockImplementation((async (cb: (em: unknown) => Promise<unknown>) =>
      cb(mockEm)) as never);

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    const { expiresIn } = mockOtpLogRepo.create.mock.calls[0]![0] as { expiresIn: Date };
    expect(expiresIn.getTime() - Date.now()).toBe(5 * 60_000);

    vi.useRealTimers();
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
