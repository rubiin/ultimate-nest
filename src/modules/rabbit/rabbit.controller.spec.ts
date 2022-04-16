import { Test, TestingModule } from "@nestjs/testing";
import { RabbitController } from "./rabbit.controller";

describe("RabbitController", () => {
	let controller: RabbitController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RabbitController],
		}).compile();

		controller = module.get<RabbitController>(RabbitController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
