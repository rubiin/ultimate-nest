import { Post as PostEntity } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { of } from "rxjs";

import { PostService } from "./post.service";
import { PostController } from "./post.controller";

describe("PostController", () => {
  const service = createMock<PostService>();
  let controller: PostController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PostController(service);
    vi.mocked(service.findAll).mockReturnValue(of({ data: [], meta: {} as never }));
    vi.mocked(service.search).mockReturnValue(of({ data: [], meta: {} as never }));
    vi.mocked(service.findOne).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.findComments).mockReturnValue(of([]));
    vi.mocked(service.create).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.update).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.remove).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.addComment).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.editComment).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.deleteComment).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.favorite).mockReturnValue(of({} as PostEntity));
    vi.mocked(service.unFavorite).mockReturnValue(of({} as PostEntity));
  });

  it("lists posts with cursor pagination", () => {
    const dto = { limit: 10 } as never;

    controller.findAll(dto);

    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it("delegates the full-text search", () => {
    const dto = { search: "nest" } as never;

    controller.search(dto);

    expect(service.search).toHaveBeenCalledWith(dto);
  });

  it("fetches one post by slug", () => {
    controller.getById("post-slug");

    expect(service.findOne).toHaveBeenCalledWith("post-slug");
  });

  it("lists the comments of a post", () => {
    controller.findComments("post-slug");

    expect(service.findComments).toHaveBeenCalledWith("post-slug");
  });

  it("creates a post on behalf of the logged-in user", () => {
    const dto = { content: "content", title: "title" } as never;
    const author = { id: 1 } as never;

    controller.create(dto, author);

    expect(service.create).toHaveBeenCalledWith(dto, author);
  });

  it("updates a post", () => {
    const dto = { content: "edited" } as never;

    controller.update("post-slug", dto);

    expect(service.update).toHaveBeenCalledWith("post-slug", dto);
  });

  it("removes a post", () => {
    controller.remove("post-slug");

    expect(service.remove).toHaveBeenCalledWith("post-slug");
  });

  it("adds a comment using the logged-in user's id", () => {
    const dto = { body: "nice" } as never;

    controller.createComment(7, "post-slug", dto);

    expect(service.addComment).toHaveBeenCalledWith(7, "post-slug", dto);
  });

  it("edits a comment", () => {
    const dto = { body: "edited" } as never;

    controller.editComment("post-slug", "comment-idx", dto);

    expect(service.editComment).toHaveBeenCalledWith("post-slug", "comment-idx", dto);
  });

  it("deletes a comment", () => {
    controller.deleteComment("post-slug", "comment-idx");

    expect(service.deleteComment).toHaveBeenCalledWith("post-slug", "comment-idx");
  });

  it("favorites a post", () => {
    controller.favorite(7, "post-slug");

    expect(service.favorite).toHaveBeenCalledWith(7, "post-slug");
  });

  it("un-favorites a post", () => {
    controller.unFavorite(7, "post-slug");

    expect(service.unFavorite).toHaveBeenCalledWith(7, "post-slug");
  });
});
