import { Body, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Observable } from "rxjs";
import type { PaginationResponse } from "@common/@types";
import { Action } from "@common/@types";
import {
  ApiPaginatedResponse,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
  UUIDParam,
} from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import { Comment, Post as PostEntity, User } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl";
import { PostService } from "./post.service";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";

@GenericController("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiPaginatedResponse(PostEntity)
  findAll(@Query() dto: CursorPaginationDto): Observable<PaginationResponse<PostEntity>> {
    return this.postService.findAll(dto);
  }

  @Get(":slug")
  @SwaggerResponse({
    operation: "Post fetch",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  getById(@Param("slug") slug: string): Observable<PostEntity> {
    return this.postService.findOne(slug);
  }

  @Get(":slug/comments")
  @SwaggerResponse({
    operation: "Post comment fetch",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  findComments(@Param("slug") slug: string): Observable<Comment[]> {
    return this.postService.findComments(slug);
  }

  @Post()
  @SwaggerResponse({ operation: "create post" })
  @CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Create))
  create(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
    return this.postService.create(dto, author);
  }

  @Patch(":slug")
  @SwaggerResponse({
    operation: "Post update",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  @CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Update))
  update(@Param("slug") slug: string, @Body() dto: EditPostDto): Observable<PostEntity> {
    return this.postService.update(slug, dto);
  }

  @Delete(":slug")
  @SwaggerResponse({
    operation: "Post delete",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  @CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Delete))
  remove(@Param("slug") slug: string): Observable<PostEntity> {
    return this.postService.remove(slug);
  }

  @Post(":slug/comments")
  @SwaggerResponse({
    operation: "Post comment create",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  @CheckPolicies(new GenericPolicyHandler(Comment, Action.Create))
  createComment(
        @LoggedInUser("id") user: number, @Param("slug")
slug: string, @Body()
commentData: CreateCommentDto,
  ) {
    return this.postService.addComment(user, slug, commentData);
  }

  @Patch(":slug/comments/:commentIdx")
  @SwaggerResponse({
    operation: "Post comment edit",
    notFound: "Post doesn't exist.",
    params: ["slug", "commentIdx"],
  })
  @CheckPolicies(new GenericPolicyHandler(Comment, Action.Delete))
  editComment(
        @Param("slug") slug: string, @UUIDParam("commentIdx")
commentIndex: string, @Body()
commentData: CreateCommentDto,
  ) {
    return this.postService.editComment(slug, commentIndex, commentData);
  }

  @Delete(":slug/comments/:commentIdx")
  @SwaggerResponse({
    operation: "Post comment delete",
    notFound: "Post doesn't exist.",
    params: ["slug", "commentIdx"],
  })
  @CheckPolicies(new GenericPolicyHandler(Comment, Action.Delete))
  deleteComment(@Param("slug") slug: string, @UUIDParam("commentIdx") commentIndex: string) {
    return this.postService.deleteComment(slug, commentIndex);
  }

  @Post(":slug/favorite")
  @SwaggerResponse({
    operation: "Post favorite",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  favorite(@LoggedInUser("id") userId: number, @UUIDParam("slug") slug: string) {
    return this.postService.favorite(userId, slug);
  }

  @Delete(":slug/favorite")
  @SwaggerResponse({
    operation: "Post unfavorite",
    notFound: "Post doesn't exist.",
    params: ["slug"],
  })
  unFavorite(@LoggedInUser("id") userId: number, @Param("slug") slug: string) {
    return this.postService.unFavorite(userId, slug);
  }
}
