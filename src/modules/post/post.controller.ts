import { Action, CursorPaginationResponse } from "@common/@types";
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
import { Body, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@GenericController("posts")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	@ApiPaginatedResponse(PostEntity, "Post list")
	findAll(@Query() dto: CursorPaginationDto): Observable<CursorPaginationResponse<PostEntity>> {
		return this.postService.findAll(dto);
	}

	@Get(":idx")
	@SwaggerResponse({
		operation: "Post fetch",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	getById(@UUIDParam("idx") index: string): Observable<PostEntity> {
		return this.postService.findOne(index);
	}

	@Get(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment fetch",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	findComments(@UUIDParam("idx") index: string): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Post()
	@SwaggerResponse({ operation: "create post" })
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Create))
	create(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
		return this.postService.create(dto, author);
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "Post update",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Update))
	update(@UUIDParam("idx") index: string, @Body() dto: EditPostDto): Observable<PostEntity> {
		return this.postService.update(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "Post delete",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Delete))
	remove(@UUIDParam("idx") index: string): Observable<PostEntity> {
		return this.postService.remove(index);
	}

	@Post(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment create",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(Comment, Action.Create))
	createComment(
		@LoggedInUser("id") user: number,
		@UUIDParam("idx") index: string,
		@Body() commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	// TODO: edit comment

	@Delete(":idx/comments/:commentIdx")
	@SwaggerResponse({
		operation: "Post comment delete",
		notFound: "Post doesn't exist.",
		params: ["idx", "commentIdx"],
	})
	@CheckPolicies(new GenericPolicyHandler(Comment, Action.Delete))
	deleteComment(
		@UUIDParam("idx") postIndex: string,
		@UUIDParam("commentIdx") commentIndex: string,
	) {
		return this.postService.deleteComment(postIndex, commentIndex);
	}

	@Post(":idx/favorite")
	@SwaggerResponse({
		operation: "Post favorite",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	favorite(@LoggedInUser("id") userId: number, @UUIDParam("idx") index: string) {
		return this.postService.favorite(userId, index);
	}

	@Delete(":idx/favorite")
	@SwaggerResponse({
		operation: "Post unfavorite",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	unFavorite(@LoggedInUser("id") userId: number, @UUIDParam("idx") index: string) {
		return this.postService.unFavorite(userId, index);
	}
}
