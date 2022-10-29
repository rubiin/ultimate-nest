import { PageOptionsDto } from "@common/classes/pagination";
import { GenericController, LoggedInUser, SwaggerResponse, ApiPaginatedResponse } from "@common/decorators";
import { Comment, Post as PostEntity, User } from "@entities";
import { Pagination } from "@lib/pagination";
import { Body, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common";
import { Observable } from "rxjs";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@GenericController("posts")
export class PostController {
	constructor(private readonly postService: PostService) { }

	@Get()
	@ApiPaginatedResponse(PostEntity, "Post list")
	getMany(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<PostEntity>> {
		return this.postService.getMany(pageOptionsDto);
	}

	@Get(":idx")
	@SwaggerResponse({
		operation: "Post fetch",
		notFound: "Post doesn't exist.",
	})
	getById(@Param("idx", ParseUUIDPipe) index: string): Observable<PostEntity> {
		return this.postService.getById(index);
	}

	@Get(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment fetch",
		notFound: "Post doesn't exist.",
	})
	findComments(@Param("idx", ParseUUIDPipe) index: string): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Post()
	@SwaggerResponse({ operation: "create post" })
	async createPost(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
		return this.postService.createOne(dto, author);
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "Post update",
		notFound: "Post doesn't exist.",
	})
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditPostDto,
	): Observable<PostEntity> {
		return this.postService.editOne(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "Post delete",
		notFound: "Post doesn't exist.",
	})
	deleteOne(@Param("idx", ParseUUIDPipe) index: string): Observable<PostEntity> {
		return this.postService.deleteOne(index);
	}

	@Post(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment create",
		notFound: "Post doesn't exist.",
	})
	async createComment(
		@LoggedInUser("id") user: number,
		@Param("idx", ParseUUIDPipe) index: string,
		@Body("comment") commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	@Delete(":idx/comments")
	@SwaggerResponse({
		operation: "Post comment delete",
		notFound: "Post doesn't exist.",
	})
	deleteComment(@Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.deleteComment(index);
	}

	@Post(":idx/favorite")
	@SwaggerResponse({
		operation: "Post favorite",
		notFound: "Post doesn't exist.",
	})
	favorite(@LoggedInUser("id") userId: number, @Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.favorite(userId, index);
	}

	@Delete(":idx/favorite")
	@SwaggerResponse({
		operation: "Post unfavorite",
		notFound: "Post doesn't exist.",
	})
	async unFavorite(
		@LoggedInUser("id") userId: number,
		@Param("idx", ParseUUIDPipe) index: string,
	) {
		return this.postService.unFavorite(userId, index);
	}
}
