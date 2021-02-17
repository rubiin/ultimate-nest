import { Test, TestingModule } from '@nestjs/testing';
import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';

describe('IdeaController', () => {
	let controller: IdeaController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [IdeaController],
			providers: [IdeaService],
		}).compile();

		controller = module.get<IdeaController>(IdeaController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
