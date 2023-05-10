import { User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { mockedUser, mockEm, mockUserRepo } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { ProfileService } from "./profile.service";

describe("ProfileService", () => {
	let service: ProfileService;

	beforeEach(async () => {
		jest.clearAllMocks();
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
				{ username: "username" },
				{
					populate: [],
					populateWhere: {
						followers: { isActive: true, isDeleted: false },
						followed: { isActive: true, isDeleted: false },
						posts: { isActive: true, isDeleted: false },
						favorites: { isActive: true, isDeleted: false },
					},
				},
			);
		});
	});
});
