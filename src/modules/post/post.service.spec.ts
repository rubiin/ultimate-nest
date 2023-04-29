import { Category, Comment, Post, Tag, User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import {
	mockCategoryRepo,
	mockCommentRepo,
	mockedPost,
	mockEm,
	mockPostRepo,
	mockTagsRepo,
	mockUserRepo,
	queryDto,
} from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { PostService } from "./post.service";

describe("PostService", () => {
	let service: PostService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostService,
				{ provide: EntityManager, useValue: mockEm },

				{
					provide: getRepositoryToken(Post),
					useValue: mockPostRepo,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
				{
					provide: getRepositoryToken(Tag),
					useValue: mockTagsRepo,
				},
				{
					provide: getRepositoryToken(Comment),
					useValue: mockCommentRepo,
				},
				{
					provide: getRepositoryToken(Category),
					useValue: mockCategoryRepo,
				},
			],
		}).compile();

		service = module.get<PostService>(PostService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should findOne", () => {
		const findOneSpy = mockPostRepo.findOne;

		service.findOne("postId").subscribe(result => {
			expect(result).toStrictEqual({ ...mockedPost, idx: "postId" });
			expect(findOneSpy).toBeCalledWith(
				{
					idx: "postId",
					isActive: true,
					isObsolete: false,
				},
				{ populate: [] },
			);
		});
	});

	it("should get post list", () => {
		const findmanySpy = mockPostRepo.findAndPaginate.mockResolvedValue({
			results: [],
			total: 100,
		});

		service.findAll(queryDto).subscribe(result => {
			expect(result.meta).toBeDefined();
			expect(result.data).toStrictEqual([]);
			expect(findmanySpy).toHaveBeenCalled();
		});
	});

	it("should remove post", () => {
		service.remove("postId").subscribe(result => {
			expect(result).toStrictEqual({
				...mockedPost,
				idx: "postId",
				isObsolete: true,
				deletedAt: expect.any(Date),
			});
			expect(mockPostRepo.findOne).toBeCalledWith(
				{ idx: "postId", isActive: true, isObsolete: false },
				{ populate: [] },
			);

			expect(mockPostRepo.softRemoveAndFlush).toBeCalled();
		});
	});

	it("should edit post", () => {
		mockPostRepo.assign.mockImplementation((entity, data) => {
			return Object.assign(entity, data);
		});

		service.update("postId", { content: "new content" }).subscribe(result => {
			expect(result).toStrictEqual({
				...mockedPost,
				idx: "postId",
				content: "new content",
			});
			expect(mockPostRepo.findOne).toBeCalledWith({ idx: "postId" }, { populate: [] });
		});
	});
});
