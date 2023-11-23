import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { authenticator } from "otplib";
import qrCode from "qrcode";

import { loggedInUser, mockConfigService, mockEm, mockResponse, mockUserRepo } from "@mocks";
import { User } from "@entities";
import { TwoFactorService } from "./twofa.service";

describe("twoFactorService", () => {
  let service: TwoFactorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: EntityManager, useValue: mockEm },

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  // set up mocks

  jest.spyOn(authenticator, "verify").mockReturnValue(true);
  jest.spyOn(authenticator, "keyuri").mockReturnValue("some key uri");
  jest.spyOn(authenticator, "generateSecret").mockReturnValue("some secret");
  jest.spyOn(qrCode, "toFileStream").mockImplementationOnce(() => Promise.resolve());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should if two factor authentication code is valid", () => {
    const response = service.isTwoFactorCodeValid("someCode", loggedInUser);

    expect(response).toBeDefined();
    expect(response).toBeTruthy();
    expect(authenticator.verify).toHaveBeenCalledWith({
      token: "someCode",
      secret: loggedInUser.twoFactorSecret,
    });
  });

  it("should if turn on two factor authentication for logged in user", () => {
    const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

    service.turnOnTwoFactorAuthentication("someCode", loggedInUser).subscribe((result) => {
      expect(result).toBeDefined();
      expect(twoFactorValidSpy).toHaveBeenCalled();
      expect(mockUserRepo.assign).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(twoFactorValidSpy).toHaveBeenCalledWith({
        token: "someCode",
        secret: loggedInUser.twoFactorSecret,
      });
    });
  });

  it("should generate two factor secret", () => {
    const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

    service.turnOnTwoFactorAuthentication("someCode", loggedInUser).subscribe((result) => {
      expect(result).toBeDefined();
      expect(twoFactorValidSpy).toHaveBeenCalled();
      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(authenticator.keyuri).toHaveBeenCalled();
      expect(mockUserRepo.assign).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(twoFactorValidSpy).toHaveBeenCalledWith({
        token: "someCode",
        secret: loggedInUser.twoFactorSecret,
      });
    });
  });

  it("should pipe qr code to response", () => {
    service.pipeQrCodeStream(mockResponse, "www.link.com").subscribe((_result) => {
      expect(qrCode.toFileStream).toHaveBeenCalled();
    });
  });
});
