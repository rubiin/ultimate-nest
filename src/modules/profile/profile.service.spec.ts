import { User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { mockedUser, mockEm, mockUserRepo } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { ProfileService } from "./profile.service";

describe("ProfileService", () => {
	let service: ProfileService;

	// default mocks

	mockUserRepo.findOne.mockImplementation((options: any) =>
		Promise.resolve({
			...mockedUser,
			username: options.username,
		} as any),
	);

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProfileService,
				{ provide: EntityManager, useValue: mockEm },

				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
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
				{ username: "username", isActive: true, isObsolete: false },
				{
					populate: [],
					populateWhere: {
						followers: { isActive: true, isObsolete: false },
						followed: { isActive: true, isObsolete: false },
						posts: { isActive: true, isObsolete: false },
						favorites: { isActive: true, isObsolete: false },
					},
				},
			);
		});
	});
});
