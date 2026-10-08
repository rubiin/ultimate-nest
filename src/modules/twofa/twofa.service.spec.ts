import { User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loggedInUser, mockConfigService, mockEm, mockResponse, mockUserRepo } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { OTP } from "otplib";
import qrCode from "qrcode";
import { lastValueFrom, of } from "rxjs";

import { TwoFactorService } from "./twofa.service";

// The service imports the named binding `toFileStream`, so spying on the module
// namespace object is not enough - the module itself has to be replaced.
vi.mock("qrcode", async () => {
  const { of } = await import("rxjs");
  const toFileStream = vi.fn(() => of("qr-stream"));

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

  it("should generate two factor secret", async () => {
    const result = await lastValueFrom(service.generateTwoFactorSecret(loggedInUser));

    expect(result.secret).toBe("some secret");
    expect(result.otpAuthUrl).toContain("some%20secret");
    expect(OTP.prototype.generateSecret).toHaveBeenCalled();
    expect(mockUserRepo.assign).toHaveBeenCalledWith(loggedInUser, {
      twoFactorSecret: "some secret",
    });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should pipe qr code to response", async () => {
    await lastValueFrom(service.pipeQrCodeStream(mockResponse, "www.link.com"));

    expect(qrCode.toFileStream).toHaveBeenCalledWith(mockResponse, "www.link.com");
  });
});
