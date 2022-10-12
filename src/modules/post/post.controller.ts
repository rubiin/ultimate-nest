import { PageOptionsDto } from "@common/classes/pagination";
import { GenericController, LoggedInUser, SwaggerDecorator } from "@common/decorators";
import { ApiPaginatedResponse } from "@common/swagger/ApiPaginated";
import { Comment, Post as PostEntity, User } from "@entities";
import { Pagination } from "@lib/pagination";
import { Body, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@GenericController("posts")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	@ApiOperation({ summary: "Post list" })
	@ApiPaginatedResponse(PostEntity)
	getMany(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<PostEntity>> {
		return this.postService.getMany(pageOptionsDto);
	}

	@Get(":idx")
	@SwaggerDecorator({
		operation: "Post fetch",
		notFound: "Post doesn't exist.",
	})
	getById(@Param("idx", ParseUUIDPipe) index: string): Observable<PostEntity> {
		return this.postService.getById(index);
	}

	@Get(":idx/comments")
	@SwaggerDecorator({
		operation: "Post comment fetch",
		notFound: "Post doesn't exist.",
	})
	findComments(@Param("idx", ParseUUIDPipe) index: string): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Post()
	@SwaggerDecorator({ operation: "create post" })
	async createPost(@Body() dto: CreatePostDto, @LoggedInUser() author: User) {
		return this.postService.createOne(dto, author);
	}

	@Put(":idx")
	@SwaggerDecorator({
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
	@SwaggerDecorator({
		operation: "Post delete",
		notFound: "Post doesn't exist.",
	})
	deleteOne(@Param("idx", ParseUUIDPipe) index: string): Observable<PostEntity> {
		return this.postService.deleteOne(index);
	}

	@Post(":idx/comments")
	@SwaggerDecorator({
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
	@SwaggerDecorator({
		operation: "Post comment delete",
		notFound: "Post doesn't exist.",
	})
	deleteComment(@Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.deleteComment(index);
	}

	@Post(":idx/favorite")
	@SwaggerDecorator({
		operation: "Post favorite",
		notFound: "Post doesn't exist.",
	})
	favorite(@LoggedInUser("id") userId: number, @Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.favorite(userId, index);
	}

	@Delete(":idx/favorite")
	@SwaggerDecorator({
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
