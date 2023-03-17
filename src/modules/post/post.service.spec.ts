import { BaseRepository } from "@common/database";
import { Comment, Post, Tag, User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedPost, query } from "@mocks";
import { Test, TestingModule } from "@nestjs/testing";

import { PostService } from "./post.service";

describe("PostService", () => {
	let service: PostService;

	const mockPostRepo = createMock<BaseRepository<Post>>();
	const mockUserRepo = createMock<BaseRepository<User>>();
	const mockCommentRepo = createMock<BaseRepository<Comment>>();
	const mockTagsRepo = createMock<BaseRepository<Tag>>();

	// default mocks

	mockPostRepo.findOne.mockImplementation((options: any) =>
		Promise.resolve({
			...mockedPost,
			idx: options.idx,
		} as any),
	);

	mockPostRepo.softRemoveAndFlush.mockImplementation(entity => {
		Object.assign(entity, { deletedAt: new Date(), isObsolete: true });

		return Promise.resolve(entity);
	});

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
					provide: getRepositoryToken(Tag),
					useValue: mockTagsRepo,
				},
				{
					provide: getRepositoryToken(Comment),
					useValue: mockCommentRepo,
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
				{ idx: "postId", isObsolete: false, isActive: true },
				{ populate: [] },
			);
		});
	});

	it("should get post list", () => {
		const findmanySpy = mockPostRepo.findAndPaginate.mockResolvedValue({
			results: [],
			total: 100,
		});

		service.findAll(query).subscribe(result => {
			expect(result.meta).toBeDefined();
			expect(result.links).toBeDefined();
			expect(result.items).toStrictEqual([]);
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
				{ idx: "postId", isObsolete: false, isActive: true },
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
			expect(mockPostRepo.findOne).toBeCalledWith(
				{ idx: "postId", isObsolete: false, isActive: true },
				{ populate: [] },
			);
		});
	});
});
