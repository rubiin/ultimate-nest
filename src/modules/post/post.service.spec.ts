import { Category, Comment, Post, Tag, User } from "@entities";
import { NotFoundException } from "@nestjs/common";
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

import { SearchPostsDto } from "./dtos";
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
    mockPostRepo.cursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);

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

  describe("search", () => {
    const dto = (overrides: Partial<SearchPostsDto> = {}) =>
      Object.assign(new SearchPostsDto(), { limit: 5, page: 2, search: "nest", ...overrides });

    it("should page published matches and report offset meta", async () => {
      mockPostRepo.findAndCount.mockResolvedValue([[mockedPost], 11] as never);

      const result = await lastValueFrom(service.search(dto()));

      expect(result.data).toStrictEqual([mockedPost]);
      expect(result.meta).toMatchObject({ hasNextPage: true, itemCount: 11, limit: 5, page: 2 });

      const [where, options] = mockPostRepo.findAndCount.mock.calls[0] as [
        Record<string, unknown>,
        { limit: number; offset: number; orderBy: unknown[] },
      ];

      expect(where).toMatchObject({ published: true });
      expect(options).toMatchObject({ limit: 5, offset: 5 });
      // Relevance first, primary key as the tie-breaker.
      expect(options.orderBy).toHaveLength(2);
    });

    it("should only add the filters that were given", async () => {
      mockPostRepo.findAndCount.mockResolvedValue([[], 0] as never);

      await lastValueFrom(service.search(dto()));
      await lastValueFrom(service.search(dto({ author: "a", category: "c", tag: "t" })));

      const [plain, filtered] = mockPostRepo.findAndCount.mock.calls.map(([where]) => where) as [
        Record<string, unknown>,
        Record<string, unknown>,
      ];

      expect(plain).not.toHaveProperty("tags");
      expect(plain).not.toHaveProperty("categories");
      expect(plain).not.toHaveProperty("author");
      expect(filtered).toMatchObject({
        author: { idx: "a" },
        categories: { idx: "c" },
        tags: { idx: "t" },
      });
    });
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

  it("should delete a comment and flush the removal", async () => {
    const comment = { id: 7, idx: "comment-idx" };
    const comments = new Set<unknown>([comment]);

    const post = {
      ...mockedPost,
      comments: {
        contains: (c: unknown) => comments.has(c),
        remove: (c: unknown) => comments.delete(c),
      },
      slug: "post-slug",
    };

    mockPostRepo.findOne.mockImplementation((async () => Promise.resolve(post)) as never);
    mockCommentRepo.findOneOrFail.mockImplementation((async () =>
      Promise.resolve(comment)) as never);
    mockCommentRepo.getReference.mockImplementation((() => comment) as never);
    mockEm.remove.mockImplementation(((entity: unknown) => {
      comments.delete(entity);

      return mockEm;
    }) as never);
    mockEm.flush.mockResolvedValue(undefined as never);

    await lastValueFrom(service.deleteComment("post-slug", "comment-idx"));

    expect(mockEm.remove).toHaveBeenCalled();
    expect(mockEm.flush).toHaveBeenCalled();
    expect(comments.size).toBe(0);
  });

  it("should surface a flush failure instead of silently reporting success", async () => {
    const comment = { id: 7, idx: "comment-idx" };
    const comments = new Set<unknown>([comment]);

    const post = {
      ...mockedPost,
      comments: {
        contains: (c: unknown) => comments.has(c),
        remove: (c: unknown) => comments.delete(c),
      },
      slug: "post-slug",
    };

    mockPostRepo.findOne.mockImplementation((async () => Promise.resolve(post)) as never);
    mockCommentRepo.findOneOrFail.mockImplementation((async () =>
      Promise.resolve(comment)) as never);
    mockCommentRepo.getReference.mockImplementation((() => comment) as never);
    mockEm.remove.mockReturnValue(mockEm as never);
    mockEm.flush.mockRejectedValue(new Error("constraint violation") as never);

    // Building the flush observable without returning it means the caller gets
    // `of(post)` back and the rejection is dropped on the floor.
    await expect(lastValueFrom(service.deleteComment("post-slug", "comment-idx"))).rejects.toThrow(
      "constraint violation",
    );
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

  it("should resolve the given tags before assigning them", async () => {
    const tag = { idx: "tag-idx" };
    mockPostRepo.assign.mockImplementation(((entity: Record<string, unknown>, data: object) =>
      Object.assign(entity, data)) as never);
    mockTagsRepo.find.mockResolvedValue([tag] as never);

    const result = await lastValueFrom(service.update("post-slug", { tags: ["tag-idx"] }));

    expect(mockTagsRepo.find).toHaveBeenCalledWith({ idx: ["tag-idx"] });
    expect(result).toMatchObject({ tags: [tag] });
  });

  it("should throw when the post to update does not exist", async () => {
    mockPostRepo.findOne.mockResolvedValue(null as never);

    await expect(
      lastValueFrom(service.update("missing", { content: "new content" })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  describe("findOne", () => {
    it("should throw a 404 when the slug is unknown", async () => {
      mockPostRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.findOne("missing"))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it("should forward the requested populate paths", async () => {
      await lastValueFrom(service.findOne("post-slug", ["comments"]));

      expect(mockPostRepo.findOne).toHaveBeenCalledWith(
        { slug: "post-slug" },
        { populate: ["comments"] },
      );
    });
  });

  describe("create", () => {
    const author = { id: 1 } as User;

    it("should resolve tags and categories, then persist and flush the post", async () => {
      const tag = { idx: "tag-idx" };
      const category = { idx: "category-idx" };
      mockTagsRepo.find.mockResolvedValue([tag] as never);
      mockCategoryRepo.find.mockResolvedValue([category] as never);
      mockPostRepo.create.mockImplementation(((data: object) => ({ ...data })) as never);
      mockEm.persist.mockReturnValue(mockEm as never);

      const result = await lastValueFrom(
        service.create(
          {
            categories: ["category-idx"],
            content: "content",
            published: true,
            tags: ["tag-idx"],
            title: "title",
          } as never,
          author,
        ),
      );

      expect(mockPostRepo.create).toHaveBeenCalledWith({
        author,
        categories: [category],
        content: "content",
        published: true,
        tags: [tag],
        title: "title",
      });
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result).toMatchObject({ tags: [tag], title: "title" });
    });

    it("should default published to false", async () => {
      mockTagsRepo.find.mockResolvedValue([] as never);
      mockCategoryRepo.find.mockResolvedValue([] as never);
      mockPostRepo.create.mockImplementation(((data: object) => ({ ...data })) as never);
      mockEm.persist.mockReturnValue(mockEm as never);

      await lastValueFrom(
        service.create({ content: "content", tags: [], categories: [] } as never, author),
      );

      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ published: false }),
      );
    });
  });

  describe("favorite", () => {
    const build = (favorites: Set<Post>, post: Post) => {
      mockPostRepo.findOneOrFail.mockImplementation((async () => Promise.resolve(post)) as never);
      mockUserRepo.findOneOrFail.mockImplementation((async () =>
        Promise.resolve({
          favorites: {
            add: (p: Post) => favorites.add(p),
            contains: (p: Post) => favorites.has(p),
          },
          id: 1,
        })) as never);
    };

    it("should add the post to the user's favorites and bump the counter", async () => {
      const post = { ...mockedPost, favoritesCount: 2 } as unknown as Post;
      const favorites = new Set<Post>();
      build(favorites, post);

      const result = await lastValueFrom(service.favorite(1, "post-slug"));

      expect(favorites.has(post)).toBe(true);
      expect(result.favoritesCount).toBe(3);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("should be idempotent when the post is already favorited", async () => {
      const post = { ...mockedPost, favoritesCount: 2 } as unknown as Post;
      const favorites = new Set<Post>([post]);
      build(favorites, post);

      const result = await lastValueFrom(service.favorite(1, "post-slug"));

      expect(favorites.size).toBe(1);
      expect(result.favoritesCount).toBe(2);
    });

    it("should count from zero when the post has never been favorited", async () => {
      const post = { ...mockedPost, favoritesCount: undefined } as unknown as Post;
      const favorites = new Set<Post>();
      build(favorites, post);

      const result = await lastValueFrom(service.favorite(1, "post-slug"));

      expect(result.favoritesCount).toBe(1);
    });

    it("should only load active favorites for the user", async () => {
      const post = { ...mockedPost } as unknown as Post;
      build(new Set<Post>(), post);

      await lastValueFrom(service.favorite(1, "post-slug"));

      expect(mockUserRepo.findOneOrFail).toHaveBeenCalledWith(
        { id: 1 },
        { populate: ["favorites"], populateWhere: { favorites: { isActive: true } } },
      );
    });
  });

  describe("findComments", () => {
    it("should return only the active comments", async () => {
      const comments = [{ id: 1 }, { id: 2 }];
      mockPostRepo.findOne.mockImplementation((async () =>
        Promise.resolve({ ...mockedPost, comments: { getItems: () => comments } })) as never);

      await expect(lastValueFrom(service.findComments("post-slug"))).resolves.toEqual(comments);
      expect(mockPostRepo.findOne).toHaveBeenCalledWith(
        { slug: "post-slug" },
        { populate: ["comments"], populateWhere: { comments: { isActive: true } } },
      );
    });

    it("should throw a 404 when the post does not exist", async () => {
      mockPostRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.findComments("missing"))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("addComment", () => {
    it("should attach the new comment to the post and flush", async () => {
      const added: unknown[] = [];
      mockPostRepo.findOne.mockImplementation((async () =>
        Promise.resolve({
          ...mockedPost,
          comments: { add: (c: unknown) => added.push(c) },
          slug: "post-slug",
        })) as never);
      mockUserRepo.findOneOrFail.mockImplementation((async () =>
        Promise.resolve({ id: 7 })) as never);

      const result = await lastValueFrom(service.addComment(7, "post-slug", { body: "nice post" }));

      expect(added).toHaveLength(1);
      expect(added[0]).toMatchObject({ body: "nice post" });
      expect(result).toMatchObject({ slug: "post-slug" });
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("should propagate a missing post as a 404", async () => {
      mockPostRepo.findOne.mockResolvedValue(null as never);
      mockUserRepo.findOneOrFail.mockImplementation((async () =>
        Promise.resolve({ id: 7 })) as never);

      await expect(
        lastValueFrom(service.addComment(7, "missing", { body: "nice post" })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("editComment", () => {
    it("should assign the new comment data and return the post", async () => {
      const comment = { id: 7 };
      mockPostRepo.findOne.mockImplementation((async () =>
        Promise.resolve({ ...mockedPost, comments: {}, slug: "post-slug" })) as never);
      mockCommentRepo.findOneOrFail.mockImplementation((async () =>
        Promise.resolve(comment)) as never);
      mockCommentRepo.assign.mockImplementation(((entity: Record<string, unknown>, data: object) =>
        Object.assign(entity, data)) as never);

      const result = await lastValueFrom(
        service.editComment("post-slug", "comment-idx", { body: "edited" }),
      );

      expect(mockPostRepo.findOne).toHaveBeenCalledWith(
        { slug: "post-slug" },
        { populate: ["comments"] },
      );
      expect(comment).toMatchObject({ body: "edited" });
      expect(result).toMatchObject({ slug: "post-slug" });
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });

  it("should return the post untouched when the comment is not attached", async () => {
    const comment = { id: 7 };
    mockPostRepo.findOne.mockImplementation((async () =>
      Promise.resolve({
        ...mockedPost,
        comments: { contains: () => false, remove: vi.fn<() => void>() },
        slug: "post-slug",
      })) as never);
    mockCommentRepo.findOneOrFail.mockImplementation((async () =>
      Promise.resolve(comment)) as never);
    mockCommentRepo.getReference.mockImplementation((() => comment) as never);

    const result = await lastValueFrom(service.deleteComment("post-slug", "comment-idx"));

    expect(mockEm.remove).not.toHaveBeenCalled();
    expect(result).toMatchObject({ slug: "post-slug" });
  });
});
