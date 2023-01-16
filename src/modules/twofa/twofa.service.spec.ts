import { Test, TestingModule } from "@nestjs/testing";

import { TwoFactorAuthenticationService } from "./twofa.service";

describe("TwoFactorAuthenticationService", () => {
	let service: TwoFactorAuthenticationService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TwoFactorAuthenticationService],
		}).compile();

		service = module.get<TwoFactorAuthenticationService>(TwoFactorAuthenticationService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
