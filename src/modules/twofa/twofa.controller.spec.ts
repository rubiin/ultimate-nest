import { Test, TestingModule } from "@nestjs/testing";

import { TwoFactorAuthenticationController } from "./twofa.controller";
import { TwoFactorAuthenticationService } from "./twofa.service";

describe("TwoFactorAuthenticationController", () => {
	let controller: TwoFactorAuthenticationService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TwoFactorAuthenticationController],
			providers: [TwoFactorAuthenticationService],
		}).compile();

		controller = module.get<TwoFactorAuthenticationController>(TwoFactorAuthenticationController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
