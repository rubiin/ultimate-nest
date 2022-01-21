import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';

describe('ProfileController', () => {
	let controller: ProfileController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProfileController],
		}).compile();

		controller = module.get<ProfileController>(ProfileController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
