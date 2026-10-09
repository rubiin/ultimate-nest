import { Category, Comment, Post, Tag, User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
  mockCategoryRepo,
  mockCommentRepo,
  mockEm,
  mockPostRepo,
  mockTagsRepo,
  mockUserRepo,
  mockedPost,
  queryDto,
} from "@mocks";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom, of } from "rxjs";

import { PostService } from "./post.service";

describe("postService", () => {
  let service: PostService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // The shared mock returns a `{ user }` wrapper keyed on `title`; PostService
    // looks posts up by slug and expects the entity itself.
    mockPostRepo.findOne.mockImplementation((async (options: { slug?: string }) =>
      Promise.resolve({ ...mockedPost, slug: options.slug })) as never);
    mockPostRepo.findOneOrFail.mockImplementation((async (options: { idx?: string }) =>
      Promise.resolve({ ...mockedPost, favoritesCount: 0, slug: options.idx })) as never);
    mockEm.flush.mockResolvedValue(undefined);
    mockPostRepo.qbCursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },

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

  it("should findOne", async () => {
    const findOneSpy = mockPostRepo.findOne;

    const result = await lastValueFrom(service.findOne("post-slug"));

    expect(result).toStrictEqual({ ...mockedPost, slug: "post-slug" });
    expect(findOneSpy).toHaveBeenCalledWith({ slug: "post-slug" }, { populate: [] });
  });

  it("should get post list", async () => {
    const result = await lastValueFrom(service.findAll(queryDto));

    expect(result.meta).toBeDefined();
    expect(result.data).toStrictEqual([]);
  });

  it("should remove post", async () => {
    const result = await lastValueFrom(service.remove("post-slug"));

    expect(result).toMatchObject({ ...mockedPost, isDeleted: true, slug: "post-slug" });
    expect(mockPostRepo.findOne).toHaveBeenCalledWith({ slug: "post-slug" }, { populate: [] });
    expect(mockPostRepo.softRemoveAndFlush).toHaveBeenCalled();
  });

  it("should decrement and remove only when the post is already favorited", async () => {
    const post = { ...mockedPost, favoritesCount: 2, slug: "post-slug" } as unknown as Post;
    const favorites = new Set<Post>([post]);

    mockPostRepo.findOneOrFail.mockImplementation((async () => Promise.resolve(post)) as never);
    mockUserRepo.findOneOrFail.mockImplementation((async () =>
      Promise.resolve({
        favorites: {
          contains: (p: Post) => favorites.has(p),
          remove: (p: Post) => favorites.delete(p),
        },
        id: 1,
      })) as never);

    const result = await lastValueFrom(service.unFavorite(1, "post-slug"));

    expect(result.favoritesCount).toBe(1);
    expect(favorites.size).toBe(0);
  });

  it("should not decrement when the post was never favorited", async () => {
    const post = { ...mockedPost, favoritesCount: 2, slug: "post-slug" } as unknown as Post;
    const favorites = new Set<Post>();

    mockPostRepo.findOneOrFail.mockImplementation((async () => Promise.resolve(post)) as never);
    mockUserRepo.findOneOrFail.mockImplementation((async () =>
      Promise.resolve({
        favorites: {
          contains: (p: Post) => favorites.has(p),
          remove: (p: Post) => favorites.delete(p),
        },
        id: 1,
      })) as never);

    const result = await lastValueFrom(service.unFavorite(1, "post-slug"));

    expect(result.favoritesCount).toBe(2);
  });

  it("should edit post", async () => {
    mockPostRepo.assign.mockImplementation(((entity: Record<string, unknown>, data: object) =>
      Object.assign(entity, data)) as never);

    const result = await lastValueFrom(service.update("post-slug", { content: "new content" }));

    expect(result).toStrictEqual({
      ...mockedPost,
      content: "new content",
      slug: "post-slug",
    });
    expect(mockPostRepo.findOne).toHaveBeenCalledWith({ slug: "post-slug" }, { populate: [] });
  });
});
