import { Test, TestingModule } from "@nestjs/testing";

import { TwoFactorService } from "./twofa.service";

describe("TwoFactorAuthenticationService", () => {
	let service: TwoFactorService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TwoFactorService],
		}).compile();

		service = module.get<TwoFactorService>(TwoFactorService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
