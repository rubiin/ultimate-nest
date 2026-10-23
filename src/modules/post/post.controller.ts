import { PaginationResponse } from "@common/@types";
import { Action } from "@common/@types";
import {
  ApiPaginatedResponse,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
  UUIDParam,
} from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import { User } from "@entities";
import { Comment, Post as PostEntity } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl";
import { Body, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateCommentDto, CreatePostDto, EditPostDto, SearchPostsDto } from "./dtos";
import { PostService } from "./post.service";

const POST_NOT_FOUND = "Post doesn't exist.";

@GenericController("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiPaginatedResponse(PostEntity)
  findAll(@Query() dto: CursorPaginationDto): Observable<PaginationResponse<PostEntity>> {
    return this.postService.findAll(dto);
  }

  @Get("search")
  @ApiPaginatedResponse(PostEntity)
  search(@Query() dto: SearchPostsDto): Observable<PaginationResponse<PostEntity>> {
    return this.postService.search(dto);
  }

  @Get(":slug")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post fetch",
    params: ["slug"],
  })
  getById(@Param("slug") slug: string): Observable<PostEntity> {
    return this.postService.findOne(slug);
  }

  @Get(":slug/comments")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post comment fetch",
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
    notFound: POST_NOT_FOUND,
    operation: "Post update",
    params: ["slug"],
  })
  @CheckPolicies(
    new GenericPolicyHandler(PostEntity, Action.Update, { param: "slug", field: "slug" }),
  )
  update(@Param("slug") slug: string, @Body() dto: EditPostDto): Observable<PostEntity> {
    return this.postService.update(slug, dto);
  }

  @Delete(":slug")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post delete",
    params: ["slug"],
  })
  @CheckPolicies(
    new GenericPolicyHandler(PostEntity, Action.Delete, { param: "slug", field: "slug" }),
  )
  remove(@Param("slug") slug: string): Observable<PostEntity> {
    return this.postService.remove(slug);
  }

  @Post(":slug/comments")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post comment create",
    params: ["slug"],
  })
  @CheckPolicies(new GenericPolicyHandler(Comment, Action.Create))
  createComment(
    @LoggedInUser("id") user: number,
    @Param("slug")
    slug: string,
    @Body()
    commentData: CreateCommentDto,
  ) {
    return this.postService.addComment(user, slug, commentData);
  }

  @Patch(":slug/comments/:commentIdx")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post comment edit",
    params: ["slug", "commentIdx"],
  })
  @CheckPolicies(
    new GenericPolicyHandler(Comment, Action.Delete, { param: "commentIdx", field: "idx" }),
  )
  editComment(
    @Param("slug") slug: string,
    @UUIDParam("commentIdx")
    commentIndex: string,
    @Body()
    commentData: CreateCommentDto,
  ) {
    return this.postService.editComment(slug, commentIndex, commentData);
  }

  @Delete(":slug/comments/:commentIdx")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post comment delete",
    params: ["slug", "commentIdx"],
  })
  @CheckPolicies(
    new GenericPolicyHandler(Comment, Action.Delete, { param: "commentIdx", field: "idx" }),
  )
  deleteComment(@Param("slug") slug: string, @UUIDParam("commentIdx") commentIndex: string) {
    return this.postService.deleteComment(slug, commentIndex);
  }

  @Post(":slug/favorite")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post favorite",
    params: ["slug"],
  })
  favorite(@LoggedInUser("id") userId: number, @UUIDParam("slug") slug: string) {
    return this.postService.favorite(userId, slug);
  }

  @Delete(":slug/favorite")
  @SwaggerResponse({
    notFound: POST_NOT_FOUND,
    operation: "Post unfavorite",
    params: ["slug"],
  })
  unFavorite(@LoggedInUser("id") userId: number, @Param("slug") slug: string) {
    return this.postService.unFavorite(userId, slug);
  }
}
