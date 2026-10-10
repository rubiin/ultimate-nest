import { User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loggedInUser, mockConfigService, mockEm, mockResponse, mockUserRepo } from "@mocks";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { OTP } from "otplib";
import qrCode from "qrcode";
import { lastValueFrom, of } from "rxjs";

import { TwoFactorService } from "./twofa.service";

// The service imports the named binding `toFileStream`, so spying on the module
// namespace object is not enough - the module itself has to be replaced. Like the real one, the
// mock returns nothing: it writes into the stream.
vi.mock("qrcode", () => {
  const toFileStream = vi.fn<() => void>();

  return { default: { toFileStream }, toFileStream };
});

describe("twoFactorService", () => {
  let service: TwoFactorService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // The service builds its own `new OTP()` in the constructor, so the
    // instance methods have to be stubbed on the prototype.
    vi.spyOn(OTP.prototype, "generateSecret").mockReturnValue("some secret");
    vi.spyOn(OTP.prototype, "verify").mockResolvedValue({ valid: true } as never);
    mockConfigService.get.mockReturnValue("Test App");
    mockEm.flush.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should verify the two factor authentication code", async () => {
    const result = await lastValueFrom(service.isTwoFactorCodeValid("someCode", loggedInUser));

    expect(result).toBe(true);
    expect(OTP.prototype.verify).toHaveBeenCalledWith({
      secret: loggedInUser.twoFactorSecret,
      token: "someCode",
    });
  });

  it("should return false when the code is not valid", async () => {
    vi.mocked(OTP.prototype.verify).mockResolvedValue({ valid: false });

    const result = await lastValueFrom(service.isTwoFactorCodeValid("badCode", loggedInUser));

    expect(result).toBe(false);
  });

  it("should turn on two factor authentication for logged in user", async () => {
    const twoFactorValidSpy = vi
      .spyOn(service, "isTwoFactorCodeValid")
      .mockReturnValue(of(true) as never);

    const result = await lastValueFrom(
      service.turnOnTwoFactorAuthentication("someCode", loggedInUser),
    );

    expect(result).toBeDefined();
    expect(twoFactorValidSpy).toHaveBeenCalledWith("someCode", loggedInUser);
    expect(mockUserRepo.assign).toHaveBeenCalledWith(loggedInUser, {
      isTwoFactorEnabled: true,
    });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  // Regression: the validity check was an unsubscribed Observable (always truthy), so any code
  // turned two factor authentication on.
  it("should not turn on two factor authentication for an invalid code", async () => {
    vi.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(of(false) as never);

    await expect(
      lastValueFrom(service.turnOnTwoFactorAuthentication("badCode", loggedInUser)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockUserRepo.assign).not.toHaveBeenCalled();
    expect(mockEm.flush).not.toHaveBeenCalled();
  });

  it("should generate two factor secret", async () => {
    const user = new User({ email: "user@example.com", id: 1, isTwoFactorEnabled: false });
    const result = await lastValueFrom(service.generateTwoFactorSecret(user));

    expect(result.secret).toBe("some secret");
    expect(result.otpAuthUrl).toContain("some%20secret");
    expect(OTP.prototype.generateSecret).toHaveBeenCalled();
    expect(mockUserRepo.assign).toHaveBeenCalledWith(user, {
      twoFactorSecret: "some secret",
    });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  // Regression: /2fa/generate overwrote the secret of an already-enabled factor.
  it("should refuse to replace the secret when two factor authentication is enabled", async () => {
    const user = new User({ id: 1, isTwoFactorEnabled: true, twoFactorSecret: "existing" });

    await expect(lastValueFrom(service.generateTwoFactorSecret(user))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(OTP.prototype.generateSecret).not.toHaveBeenCalled();
    expect(mockUserRepo.assign).not.toHaveBeenCalled();
    expect(mockEm.flush).not.toHaveBeenCalled();
    expect(user.twoFactorSecret).toBe("existing");
  });

  // Regression: `from(toFileStream(...))` wrapped `undefined` and threw, so /2fa/generate was a 500.
  it("should pipe qr code to response", async () => {
    await lastValueFrom(service.pipeQrCodeStream(mockResponse, "www.link.com"));

    expect(mockResponse.type).toHaveBeenCalledWith("png");
    expect(qrCode.toFileStream).toHaveBeenCalledWith(mockResponse, "www.link.com");
  });
});
