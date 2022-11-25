import { BaseRepository } from "@common/database/base.repository";
import { Comment, Post, User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedPost, mockedUser, query } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { lastValueFrom } from "rxjs";

import { PostService } from "./post.service";

describe("PostService", () => {
	let service: PostService;

	const mockI18n = createMock<I18nService>();
	const mockPostRepo = createMock<BaseRepository<Post>>();
	const mockUserRepo = createMock<BaseRepository<User>>();
	const mockCommentRepo = createMock<BaseRepository<Comment>>();

	// default mocks

	mockPostRepo.findOne.mockImplementation(() =>
		Promise.resolve({
			...mockedPost,
		} as any),
	);

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostService,

				{
					provide: getRepositoryToken(Post),
					useValue: mockPostRepo,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
				{
					provide: getRepositoryToken(Comment),
					useValue: mockCommentRepo,
				},
				{ provide: I18nService, useValue: mockI18n },
			],
		}).compile();

		service = module.get<PostService>(PostService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should getById", async () => {
		const findOneSpy = mockPostRepo.findOne;
		const foundPost = await lastValueFrom(service.getById("postId"));

		expect(foundPost).toEqual(mockedPost);
		expect(findOneSpy).toBeCalledWith(
			{ idx: "postId", isObsolete: false, isActive: true },
			{ populate: [] },
		);
	});

	it("should get post list", async () => {
		const findmanySpy = mockPostRepo.findAndPaginate.mockResolvedValue({
			results: [],
			total: 100,
		});

		const result = await lastValueFrom(service.getMany(query));

		expect(result.meta).toBeDefined();
		expect(result.links).toBeDefined();
		expect(result.items).toEqual([]);
		expect(findmanySpy).toHaveBeenCalled();
	});

	it("should create post", async () => {
		const loggedInUser = new User({ ...mockedUser });

		const createSpy = mockPostRepo.create.mockImplementation(
			() =>
				({
					...mockedPost,
					author: loggedInUser,
				} as any),
		);
		const result = await service.createOne(mockedPost, loggedInUser);

		expect(createSpy).toHaveBeenCalled();
		expect(createSpy).toHaveBeenCalledWith({ ...mockedPost, author: loggedInUser });
		expect(result).toEqual({ ...mockedPost, author: loggedInUser });
	});
});
