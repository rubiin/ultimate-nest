/* eslint-disable import/no-named-as-default-member  */

import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { loggedInUser } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { authenticator } from "otplib";
import qrCode from "qrcode";

import { TwoFactorService } from "./twofa.service";
import { EntityManager } from "@mikro-orm/postgresql";

describe("TwoFactorService", () => {
	let service: TwoFactorService;
	const mockConfigService = createMock<ConfigService>();
	const mockResponse = createMock<Response>();
	const mockUserRepo = createMock<BaseRepository<User>>();
	const mockEm = createMock<EntityManager>();

	beforeEach(async () => {
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
		const response = service.isTwoFactorCodeValid("some code", loggedInUser);

		expect(response).toBeDefined();
		expect(response).toBeTruthy();
		expect(authenticator.verify).toBeCalledWith({
			token: "some code",
			secret: loggedInUser.twoFactorSecret,
		});
	});

	it("should if turn on two factor authentication for logged in user", () => {
		const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

		service.turnOnTwoFactorAuthentication("some code", loggedInUser).subscribe(result => {
			expect(result).toBeDefined();
			expect(twoFactorValidSpy).toBeCalled();
			expect(mockUserRepo.assign).toBeCalled();
			expect(mockEm.flush).toBeCalled();
			expect(twoFactorValidSpy).toBeCalledWith({
				token: "some code",
				secret: loggedInUser.twoFactorSecret,
			});
		});
	});

	it("should generate two factor secret", () => {
		const twoFactorValidSpy = jest.spyOn(service, "isTwoFactorCodeValid").mockReturnValue(true);

		service.turnOnTwoFactorAuthentication("some code", loggedInUser).subscribe(result => {
			expect(result).toBeDefined();
			expect(twoFactorValidSpy).toBeCalled();
			expect(authenticator.generateSecret).toBeCalled();
			expect(authenticator.keyuri).toBeCalled();
			expect(mockUserRepo.assign).toBeCalled();
			expect(mockEm.flush).toBeCalled();
			expect(twoFactorValidSpy).toBeCalledWith({
				token: "some code",
				secret: loggedInUser.twoFactorSecret,
			});
		});
	});

	it("should pipe qr code to response", () => {
		service.pipeQrCodeStream(mockResponse, "www.link.com").subscribe(_result => {
			expect(qrCode.toFileStream).toBeCalled();
			expect(qrCode.toFileStream).toBeCalledWith(mockResponse, "www.link.com");
		});
	});
});
