import { Test, TestingModule } from "@nestjs/testing";
import { RabbitService } from "./rabbit.service";

describe("RabbitService", () => {
	let service: RabbitService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RabbitService],
		}).compile();

		service = module.get<RabbitService>(RabbitService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
