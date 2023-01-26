import { createMock } from "@golevelup/ts-jest";
import { NestCaslModule } from "@lib/casl";
import { Test, TestingModule } from "@nestjs/testing";

import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

describe("Auth Controller", () => {
	let controller: ProfileController;
	const profileService = createMock<ProfileService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [NestCaslModule],
			controllers: [ProfileController],
			providers: [
				{
					provide: ProfileService,
					useValue: profileService,
				},
			],
		}).compile();

		controller = module.get<ProfileController>(ProfileController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
