import { createMock } from "@golevelup/ts-jest";
import { NestCaslModule } from "@lib/casl";
import { AuthService } from "@modules/auth/auth.service";
import { Test, TestingModule } from "@nestjs/testing";

import { TwoFactorController } from "./twofa.controller";
import { TwoFactorService } from "./twofa.service";

describe("TwoFactorController", () => {
	let controller: TwoFactorController;
	const twoFactorService = createMock<TwoFactorService>();
	const authService = createMock<AuthService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [NestCaslModule],
			controllers: [TwoFactorController],
			providers: [
				{
					provide: TwoFactorService,
					useValue: twoFactorService,
				},

				{
					provide: AuthService,
					useValue: authService,
				},
			],
		}).compile();

		controller = module.get<TwoFactorController>(TwoFactorController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
