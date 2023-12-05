import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import {
  mockCategoryRepo,
  mockCommentRepo,
  mockEm,
  mockPostRepo,
  mockTagsRepo,
  mockUserRepo,
  mockedPost,
  mockedUser,
  queryDto,
} from "@mocks";
import { Category, Comment, Post, Tag, User } from "@entities";
import { PostService } from "./post.service";

describe("postService", () => {
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

    service.findOne("postId").subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedPost, user: mockedUser, idx: "postId" });
      expect(findOneSpy).toHaveBeenCalledWith(
        {
          idx: "postId",
        },
        { populate: [] },
      );
    });
  });

  it("should get post list", () => {
    service.findAll(queryDto).subscribe((result) => {
      expect(result.meta).toBeDefined();
      expect(result.data).toStrictEqual([]);
    });
  });

  it("should remove post", () => {
    service.remove("postId").subscribe((result: any) => {
      expect(result).toEqual({
        ...mockedPost,
        idx: "postId",
        isDeleted: true,
      });
      expect(mockPostRepo.findOne).toHaveBeenCalledWith(
        { idx: "postId", isActive: true, isDeleted: false },
        { populate: [] },
      );

      expect(mockPostRepo.softRemoveAndFlush).toHaveBeenCalled();
    });
  });

  it("should edit post", () => {
    mockPostRepo.assign.mockImplementation((entity, data) => {
      return Object.assign(entity, data);
    });

    service.update("postId", { content: "new content" }).subscribe((result) => {
      expect(result).toStrictEqual({
        ...mockedPost,
        idx: "postId",
        content: "new content",
      });
      expect(mockPostRepo.findOne).toHaveBeenCalledWith({ idx: "postId" }, { populate: [] });
    });
  });
});
