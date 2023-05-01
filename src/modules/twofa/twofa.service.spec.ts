/* eslint-disable import/no-named-as-default-member  */

import { User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { loggedInUser, mockConfigService, mockEm, mockResponse, mockUserRepo } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { authenticator } from "otplib";
import qrCode from "qrcode";

import { TwoFactorService } from "./twofa.service";

describe("TwoFactorService", () => {
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
		expect(authenticator.verify).toBeCalledWith({
			token: "someCode",
			secret: loggedInUser.twoFactorSecret,
		});
	});

	it("should if turn on two factor authentication for logged in user", () => {
		const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

		service.turnOnTwoFactorAuthentication("someCode", loggedInUser).subscribe(result => {
			expect(result).toBeDefined();
			expect(twoFactorValidSpy).toBeCalled();
			expect(mockUserRepo.assign).toBeCalled();
			expect(mockEm.flush).toBeCalled();
			expect(twoFactorValidSpy).toBeCalledWith({
				token: "someCode",
				secret: loggedInUser.twoFactorSecret,
			});
		});
	});

	it("should generate two factor secret", () => {
		const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

		service.turnOnTwoFactorAuthentication("someCode", loggedInUser).subscribe(result => {
			expect(result).toBeDefined();
			expect(twoFactorValidSpy).toBeCalled();
			expect(authenticator.generateSecret).toBeCalled();
			expect(authenticator.keyuri).toBeCalled();
			expect(mockUserRepo.assign).toBeCalled();
			expect(mockEm.flush).toBeCalled();
			expect(twoFactorValidSpy).toBeCalledWith({
				token: "someCode",
				secret: loggedInUser.twoFactorSecret,
			});
		});
	});

	it("should pipe qr code to response", () => {
		service.pipeQrCodeStream(mockResponse, "www.link.com").subscribe(_result => {
			expect(qrCode.toFileStream).toBeCalled();
		});
	});
});
