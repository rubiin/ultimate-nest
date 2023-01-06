import { BaseRepository } from "@common/database/base.repository";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedUser } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";

import { ProfileService } from "./profile.service";

describe("ProfileService", () => {
	let service: ProfileService;

	const mockI18n = createMock<I18nService>();
	const mockUserRepo = createMock<BaseRepository<User>>();

	// default mocks

	mockUserRepo.findOne.mockImplementation((options: { username: string }) =>
		Promise.resolve({
			...mockedUser,
			username: options.username,
		} as any),
	);

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProfileService,

				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
				{ provide: I18nService, useValue: mockI18n },
			],
		}).compile();

		service = module.get<ProfileService>(ProfileService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should getProfileByUsername", () => {
		service.getProfileByUsername("username").subscribe(result => {
			expect(result).toStrictEqual(mockedUser);
			expect(mockUserRepo.findOne).toBeCalledWith(
				{ username: "username", isObsolete: false, isActive: true },
				{ populate: [] },
			);
		});
	});
});
