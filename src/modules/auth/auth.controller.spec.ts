import { createMock } from "@golevelup/ts-jest";
import { NestCaslModule } from "@lib/casl";
import { TokensService } from "@modules/token/tokens.service";
import { Test, TestingModule } from "@nestjs/testing";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("Auth Controller", () => {
	let controller: AuthController;
	const authService = createMock<AuthService>();
	const tokenService = createMock<TokensService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [NestCaslModule],
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: authService,
				},

				{
					provide: TokensService,
					useValue: tokenService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
