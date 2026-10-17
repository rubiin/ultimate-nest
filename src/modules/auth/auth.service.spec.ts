import { OtpPurpose } from "@common/@types";
import { ERROR_CODES } from "@common/constant";
import { HelperService } from "@common/helpers";
import { OtpLog, Protocol, User } from "@entities";
import { ResetPasswordMail } from "@lib/mail";
import { EntityManager, TransactionPropagation } from "@mikro-orm/core";
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
  trackMockTransaction,
} from "@mocks";
import { OtpService } from "@modules/otp";
import { TokensService } from "@modules/token/tokens.service";
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mailer } from "@nestjs/mail";
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
        OtpService,

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
        { provide: Mailer, useValue: mockMailService },
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

  it("should reset password and consume the otp", async () => {
    const otp = {
      ...mockedOtpLog,
      expiresIn: new Date(Date.now() + 60_000),
      user: { getEntity: () => loggedInUser },
    };
    mockOtpLogRepo.findOne.mockResolvedValue(otp as never);

    const result = await lastValueFrom(service.resetPassword(mockResetPasswordDto));

    expect(result).toStrictEqual(loggedInUser);
    expect(mockOtpLogRepo.findOne).toHaveBeenCalledWith(
      { isUsed: false, otpCode: mockResetPasswordDto.otpCode, purpose: OtpPurpose.RESET_PASSWORD },
      { populate: ["user"] },
    );
    expect(mockOtpLogRepo.assign).toHaveBeenCalledWith(otp, { isUsed: true });
  });

  // Regression: reset accepted expired codes and never marked them used, so one code worked forever.
  it("should reject an expired reset otp without changing the password", async () => {
    mockOtpLogRepo.findOne.mockResolvedValue({
      ...mockedOtpLog,
      expiresIn: new Date(Date.now() - 60_000),
      user: { getEntity: () => loggedInUser },
    } as never);

    await expect(lastValueFrom(service.resetPassword(mockResetPasswordDto))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mockUserRepo.assign).not.toHaveBeenCalled();
  });

  it("should reject a reset code that is unknown, used or issued for another purpose", async () => {
    mockOtpLogRepo.findOne.mockResolvedValue(null as never);

    await expect(lastValueFrom(service.resetPassword(mockResetPasswordDto))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("should set otp expiry from the protocol in minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () =>
      Promise.resolve({ otpExpiryInMinutes: 5 })) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    mockMailService.send.mockResolvedValue(undefined as never);
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
    mockMailService.send.mockResolvedValue(undefined as never);
    mockEm.transactional.mockImplementation((async (cb: (em: unknown) => Promise<unknown>) =>
      cb(mockEm)) as never);

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    const { expiresIn } = mockOtpLogRepo.create.mock.calls[0]![0] as { expiresIn: Date };
    expect(expiresIn.getTime() - Date.now()).toBe(5 * 60_000);

    vi.useRealTimers();
  });

  it("should persist the otp inside a REQUIRED transaction", async () => {
    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () => Promise.resolve(null)) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    mockMailService.send.mockResolvedValue(undefined as never);
    const inTransaction = trackMockTransaction();
    const flushedInTransaction: boolean[] = [];
    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockImplementation((async () => {
      flushedInTransaction.push(inTransaction());
    }) as never);

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    expect(mockEm.transactional).toHaveBeenCalledTimes(1);
    expect(mockEm.transactional).toHaveBeenCalledWith(expect.any(Function), {
      propagation: TransactionPropagation.REQUIRED,
    });
    expect(flushedInTransaction).toStrictEqual([true]);
  });

  // Regression: the transactional body used to return a cold observable without subscribing, so no
  // reset mail was ever sent while the endpoint still answered "Otp sent successfully".
  it("should send the reset mail inside the transaction", async () => {
    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () => Promise.resolve(null)) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    const inTransaction = trackMockTransaction();
    const sentInTransaction: boolean[] = [];
    mockMailService.send.mockImplementation((async () => {
      sentInTransaction.push(inTransaction());
    }) as never);

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    expect(sentInTransaction).toStrictEqual([true]);
    expect(mockMailService.send).toHaveBeenCalledWith(
      ResetPasswordMail,
      expect.objectContaining({ to: loggedInUser.email }),
    );
  });

  it("should verify the user inside a REQUIRED transaction", async () => {
    mockOtpLogRepo.findOne.mockImplementation((async () =>
      Promise.resolve({
        ...mockedOtpLog,
        expiresIn: new Date(Date.now() + 60_000),
        user: { getEntity: () => loggedInUser, id: loggedInUser.id },
      })) as never);
    const inTransaction = trackMockTransaction();
    const calls: [string, boolean][] = [];
    mockEm.nativeUpdate.mockImplementation((async () => {
      calls.push(["nativeUpdate", inTransaction()]);
      return 1;
    }) as never);
    mockEm.flush.mockImplementation((async () => {
      calls.push(["flush", inTransaction()]);
    }) as never);

    const result = await lastValueFrom(service.verifyOtp({ otpCode: mockedOtpLog.otpCode }));

    expect(result).toStrictEqual(loggedInUser);
    expect(mockEm.transactional).toHaveBeenCalledTimes(1);
    expect(mockEm.transactional).toHaveBeenCalledWith(expect.any(Function), {
      propagation: TransactionPropagation.REQUIRED,
    });
    expect(mockEm.nativeUpdate).toHaveBeenCalledWith(
      User,
      { id: loggedInUser.id },
      { isVerified: true },
    );
    expect(calls).toStrictEqual([
      ["nativeUpdate", true],
      ["flush", true],
    ]);
  });

  // Regression: a consumed code stayed valid until it expired.
  it("should only look up unused verify-email OTP codes", async () => {
    mockOtpLogRepo.findOne.mockResolvedValue(null as never);

    await expect(
      lastValueFrom(service.verifyOtp({ otpCode: mockedOtpLog.otpCode })),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mockOtpLogRepo.findOne).toHaveBeenCalledWith(
      { isUsed: false, otpCode: mockedOtpLog.otpCode, purpose: OtpPurpose.VERIFY_EMAIL },
      { populate: ["user"] },
    );
  });

  // Regression: Promise.allSettled swallowed a failed write, so the transaction committed with the
  // OTP marked used but the user still unverified (or vice versa).
  it("should reject and roll back when one of the verification writes fails", async () => {
    mockOtpLogRepo.findOne.mockImplementation((async () =>
      Promise.resolve({
        ...mockedOtpLog,
        expiresIn: new Date(Date.now() + 60_000),
        user: { getEntity: () => loggedInUser, id: loggedInUser.id },
      })) as never);
    mockEm.nativeUpdate.mockRejectedValue(new Error("nativeUpdate failed") as never);

    await expect(
      lastValueFrom(service.verifyOtp({ otpCode: mockedOtpLog.otpCode })),
    ).rejects.toThrow("nativeUpdate failed");
    // The rejection escapes the transactional wrapper instead of being swallowed.
    expect(mockEm.transactional).toHaveBeenCalledTimes(1);
    expect(mockEm.flush).not.toHaveBeenCalled();
  });

  // Regression: `password` is a lazy property that was never loaded, `verifyHash` got its arguments
  // swapped, and a mismatch was mapped to an Observable instead of an error, so no password was ever
  // really checked.
  describe("validateUser with a password", () => {
    const storedUser = { email: "test@example.com", isActive: true, password: "stored-hash" };

    beforeEach(() => {
      mockUserRepo.findOne.mockResolvedValue(storedUser as never);
    });

    it("should reject a password that does not match the stored hash", async () => {
      const verifyHash = vi.spyOn(HelperService, "verifyHash").mockReturnValue(of(false));

      await expect(
        lastValueFrom(service.validateUser(true, storedUser.email, "wrong")),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith(
        { email: storedUser.email },
        { populate: ["password"] },
      );
      expect(verifyHash).toHaveBeenCalledWith("wrong", "stored-hash");
    });

    it("should return the user without the password when it matches", async () => {
      vi.spyOn(HelperService, "verifyHash").mockReturnValue(of(true));

      const result = await lastValueFrom(service.validateUser(true, storedUser.email, "right"));

      expect(result).toStrictEqual({ email: storedUser.email, isActive: true });
    });
  });

  it("should change password", async () => {
    const dto = {
      confirmPassword: "confirmPassword",
      oldPassword: "oldPassword",
      password: "newPassword",
    };

    mockUserRepo.findOne.mockImplementation(async () => Promise.resolve(loggedInUser));
    HelperService.verifyHash = vi
      .fn<typeof HelperService.verifyHash>()
      .mockImplementation(() => of(true));

    const result = await lastValueFrom(service.changePassword(dto, loggedInUser));

    expect(result.idx).toBe(loggedInUser.idx);
    expect(result.password).toBe(dto.password);
    // The plain password comes first; the stored hash second.
    expect(vi.mocked(HelperService.verifyHash).mock.calls[0]![0]).toBe(dto.oldPassword);
    expect(mockUserRepo.findOne).toHaveBeenCalledWith(
      { id: loggedInUser.id },
      { populate: ["password"] },
    );
  });

  describe("two factor login", () => {
    const buildUser = (isTwoFactorEnabled: boolean) =>
      new User({
        email: "2fa@example.com",
        id: 7,
        idx: "user-7",
        isActive: true,
        isTwoFactorEnabled,
      });

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(3600 as never);
      mockUserRepo.nativeUpdate.mockResolvedValue(1 as never);
      mockTokenService.generateTwoFactorToken.mockReturnValue(of("partial-token"));
      mockTokenService.generateAccessToken.mockReturnValue(of("access-token"));
      mockTokenService.generateRefreshToken.mockReturnValue(of("refresh-token"));
    });

    // Regression: a 2FA-enabled user got a full access token from the password alone.
    it("should return only a partial token for a 2fa-enabled user", async () => {
      const user = buildUser(true);
      mockUserRepo.findOne.mockResolvedValue(user as never);
      vi.spyOn(HelperService, "verifyHash").mockReturnValue(of(true));

      const result = await lastValueFrom(
        service.login({ email: user.email, password: "Password@1234" }, true),
      );

      expect(result).toStrictEqual({
        accessToken: "partial-token",
        twoFactorRequired: true,
        user: { id: 7, idx: "user-7" },
      });
      expect(mockTokenService.generateTwoFactorToken).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7 }),
      );
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();
      expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
      expect(mockUserRepo.nativeUpdate).not.toHaveBeenCalled();
    });

    it("should return the full pair for a user without 2fa", async () => {
      const user = buildUser(false);
      mockUserRepo.findOne.mockResolvedValue(user as never);
      vi.spyOn(HelperService, "verifyHash").mockReturnValue(of(true));

      const result = await lastValueFrom(
        service.login({ email: user.email, password: "Password@1234" }, true),
      );

      expect(result).toStrictEqual({
        accessToken: "access-token",
        refresh_token: "refresh-token",
        user: { id: 7, idx: "user-7" },
      });
      expect(mockTokenService.generateTwoFactorToken).not.toHaveBeenCalled();
    });

    it("should issue the full pair and record the login", async () => {
      const user = buildUser(true);

      const client = { ipAddress: "203.0.113.7", userAgent: "Firefox" };

      const result = await lastValueFrom(service.issueTokens(user, client));

      expect(result).toStrictEqual({
        accessToken: "access-token",
        refresh_token: "refresh-token",
        user: { id: 7, idx: "user-7" },
      });
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith(user, 3600, client);
      expect(mockUserRepo.nativeUpdate).toHaveBeenCalledWith(
        { id: 7 },
        { lastLogin: expect.any(Date) },
      );
    });

    // Regression: the OAuth (passwordless) path redirected with a full access token.
    it("should redirect an oauth login of a 2fa-enabled user with only the partial token", async () => {
      const user = buildUser(true);
      mockUserRepo.findOne.mockResolvedValue(user as never);
      const response = { redirect: vi.fn<() => void>() } as unknown as NestifyResponse;

      await lastValueFrom(
        service.OauthHandler({
          response,
          user: { accessToken: "provider-token", email: user.email, firstName: "a", lastName: "b" },
        }),
      );

      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringMatching(/\?token=partial-token&twoFactorRequired=true$/),
      );
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled();
      expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("validateUser without a password", () => {
    it("should reject an unknown account", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(
        lastValueFrom(service.validateUser(false, "ghost@example.com")),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("should reject a deactivated account", async () => {
      mockUserRepo.findOne.mockResolvedValue({
        email: "a@example.com",
        isActive: false,
      } as never);

      await expect(
        lastValueFrom(service.validateUser(false, "a@example.com")),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("should return the account as-is for an oauth login", async () => {
      mockUserRepo.findOne.mockResolvedValue({
        email: "a@example.com",
        isActive: true,
      } as never);

      await expect(lastValueFrom(service.validateUser(false, "a@example.com"))).resolves.toEqual({
        email: "a@example.com",
        isActive: true,
      });
      // No populate needed when there is no password to compare.
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ email: "a@example.com" }, {});
    });
  });

  describe("login", () => {
    it("should turn a missing account into invalid credentials", async () => {
      vi.spyOn(service, "validateUser").mockReturnValue(of(null as never));

      await expect(
        lastValueFrom(service.login({ email: "a@example.com" }, false)),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("forgotPassword", () => {
    it("should reject an unknown account with a 404", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(
        lastValueFrom(service.forgotPassword({ email: "ghost@example.com" })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("changePassword", () => {
    it("should reject when the account disappeared between the checks", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(
        lastValueFrom(
          service.changePassword(
            { newPassword: "n", oldPassword: "o", password: "n" } as never,
            loggedInUser,
          ),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should reject a wrong old password without writing anything", async () => {
      mockUserRepo.findOne.mockResolvedValue({
        ...loggedInUser,
        password: "stored-hash",
      } as never);
      vi.spyOn(HelperService, "verifyHash").mockReturnValue(of(false));

      await expect(
        lastValueFrom(
          service.changePassword(
            { newPassword: "n", oldPassword: "wrong", password: "n" } as never,
            loggedInUser,
          ),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockEm.flush).not.toHaveBeenCalled();
    });
  });

  describe("findUser", () => {
    it("should return the matching user", async () => {
      mockUserRepo.findOne.mockResolvedValue(loggedInUser as never);

      await expect(service.findUser({ email: loggedInUser.email })).resolves.toBe(loggedInUser);
    });

    it("should reject with the USER_NOT_FOUND error code when nothing matches", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(service.findUser({ email: "ghost@example.com" })).rejects.toMatchObject({
        response: { errorCode: ERROR_CODES.USER_NOT_FOUND },
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });

  describe("OauthHandler", () => {
    it("should redirect a plain oauth login with the full access token", async () => {
      const user = new User({
        email: "oauth@example.com",
        id: 7,
        idx: "user-7",
        isActive: true,
      });
      mockUserRepo.findOne.mockResolvedValue(user as never);
      mockUserRepo.nativeUpdate.mockResolvedValue(1 as never);
      const response = { redirect: vi.fn<() => void>() } as unknown as NestifyResponse;

      await lastValueFrom(
        service.OauthHandler({
          response,
          user: { email: user.email, firstName: "a", lastName: "b" },
        }),
      );

      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringMatching(/\?token=access-token$/),
      );
    });
  });
});
