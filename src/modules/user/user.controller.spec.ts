import { createMock } from "@golevelup/ts-jest";
import { NestCaslModule } from "@lib/casl";
import { Test, TestingModule } from "@nestjs/testing";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("User Controller", () => {
	let controller: UserController;
	const userService = createMock<UserService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [NestCaslModule],
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: userService,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
