import { Action } from "@common/@types";
import {
	ApiPaginatedResponse,
	GenericController,
	LoggedInUser,
	SwaggerResponse,
	UUIDParam,
} from "@common/decorators";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { Comment, Post as PostEntity, User } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl";
import { Pagination } from "@lib/pagination";
import { Body, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@GenericController("posts")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	@ApiPaginatedResponse(PostEntity, "Post list")
	findAll(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<PostEntity>> {
		return this.postService.findAll(pageOptionsDto);
	}

	@Get(":idx")
	@SwaggerResponse({
		operation: "Post fetch",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	getById(@UUIDParam("idx") index: string): Observable<PostEntity> {
		return this.postService.findOne(index);
	}

	@Get(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment fetch",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	findComments(@UUIDParam("idx") index: string): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Post()
	@SwaggerResponse({ operation: "create post" })
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Create))
	async create(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
		return this.postService.create(dto, author);
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "Post update",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Update))
	update(@UUIDParam("idx") index: string, @Body() dto: EditPostDto): Observable<PostEntity> {
		return this.postService.update(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "Post delete",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(PostEntity, Action.Delete))
	remove(@UUIDParam("idx") index: string): Observable<PostEntity> {
		return this.postService.remove(index);
	}

	@Post(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment create",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	async createComment(
		@LoggedInUser("id") user: number,
		@UUIDParam("idx") index: string,
		@Body() commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	@Delete(":idx/comments/:commentIdx")
	@SwaggerResponse({
		operation: "Post comment delete",
		notFounds: ["Post doesn't exist.", "Comment doesn't exist."],
		params: ["idx", "commentIdx"],
	})
	deleteComment(
		@UUIDParam("idx") postIndex: string,
		@UUIDParam("commentIdx") commentIndex: string,
	) {
		return this.postService.deleteComment(postIndex, commentIndex);
	}

	@Post(":idx/favorite")
	@SwaggerResponse({
		operation: "Post favorite",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	favorite(@LoggedInUser("id") userId: number, @UUIDParam("idx") index: string) {
		return this.postService.favorite(userId, index);
	}

	@Delete(":idx/favorite")
	@SwaggerResponse({
		operation: "Post unfavorite",
		notFounds: ["Post doesn't exist."],
		params: ["idx"],
	})
	async unFavorite(@LoggedInUser("id") userId: number, @UUIDParam("idx") index: string) {
		return this.postService.unFavorite(userId, index);
	}
}
