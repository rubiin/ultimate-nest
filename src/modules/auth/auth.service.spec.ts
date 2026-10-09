import { HelperService } from "@common/helpers";
import { OtpLog, Protocol, User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
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
import { TokensService } from "@modules/token/tokens.service";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { defer, lastValueFrom, of } from "rxjs";

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

  it("should persist the otp inside a REQUIRED transaction", async () => {
    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () => Promise.resolve(null)) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    mockMailService.sendMail.mockReturnValue(of(undefined) as never);
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

  // Regression: the transactional body returned `sendMail()`'s cold observable without subscribing,
  // so no reset mail was ever sent while the endpoint still answered "Otp sent successfully".
  it("should send the reset mail inside the transaction", async () => {
    mockUserRepo.findOne.mockImplementation((async () => Promise.resolve(loggedInUser)) as never);
    mockProtocolRepo.findOne.mockImplementation((async () => Promise.resolve(null)) as never);
    mockOtpLogRepo.create.mockImplementation(((data: object) => data) as never);
    const inTransaction = trackMockTransaction();
    const sentInTransaction: boolean[] = [];
    mockMailService.sendMail.mockReturnValue(
      defer(() => {
        sentInTransaction.push(inTransaction());

        return of(undefined);
      }) as never,
    );

    await lastValueFrom(service.forgotPassword({ email: "test@example.com" }));

    expect(sentInTransaction).toStrictEqual([true]);
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
    HelperService.verifyHash = vi.fn().mockImplementation(() => of(true));

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
});
