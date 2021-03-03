import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
	let controller: CategoriesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CategoriesController],
			providers: [CategoriesService],
		}).compile();

		controller = module.get<CategoriesController>(CategoriesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
