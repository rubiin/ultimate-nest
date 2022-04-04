import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
	let service: ProfileService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ProfileService],
		}).compile();

		service = module.get<ProfileService>(ProfileService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
