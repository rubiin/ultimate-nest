import { PageOptionsDto } from "@common/classes/pagination";
import {
	ApiPaginatedResponse,
	GenericController,
	LoggedInUser,
	SwaggerResponse,
	UUIDParam,
} from "@common/decorators";
import { Comment, Post as PostEntity, User } from "@entities";
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
	getMany(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<PostEntity>> {
		return this.postService.findAll(pageOptionsDto);
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
	async createPost(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
		return this.postService.create(dto, author);
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "Post update",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	editOne(@UUIDParam("idx") index: string, @Body() dto: EditPostDto): Observable<PostEntity> {
		return this.postService.update(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "Post delete",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	deleteOne(@UUIDParam("idx") index: string): Observable<PostEntity> {
		return this.postService.remove(index);
	}

	@Post(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment create",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	async createComment(
		@LoggedInUser("id") user: number,
		@UUIDParam("idx") index: string,
		@Body() commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	// TODO: add refactor to take comment id
	@Delete(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment delete",
		notFound: "Post doesn't exist.",
		params: ["idx"],
	})
	deleteComment(@UUIDParam("idx") index: string) {
		return this.postService.deleteComment(index);
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
	async unFavorite(@LoggedInUser("id") userId: number, @UUIDParam("idx") index: string) {
		return this.postService.unFavorite(userId, index);
	}
}
