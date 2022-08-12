import { PageOptionsDto } from "@common/classes/pagination";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ApiPaginatedResponse } from "@common/swagger/ApiPaginated";
import { Comment, Post as PostEntity, User as UserEntity } from "@entities";
import { Pagination } from "@lib/pagination";
import {
	Body,
	CacheInterceptor,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AccessGuard } from "nest-casl";
import { Observable } from "rxjs";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@ApiTags("Posts")
@UseGuards(JwtAuthGuard, AccessGuard)
@UseInterceptors(CacheInterceptor)
@Controller("posts")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@ApiOperation({ summary: "Post list" })
	@ApiPaginatedResponse(PostEntity)
	@Get()
	getMany(
		@Query() pageOptionsDto: PageOptionsDto,
	): Observable<Pagination<PostEntity>> {
		return this.postService.getMany(pageOptionsDto);
	}

	@ApiOperation({ summary: "Post fetch" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Get(":idx")
	getById(
		@Param("idx", ParseUUIDPipe) index: string,
	): Observable<PostEntity> {
		return this.postService.getById(index);
	}

	@ApiOperation({ summary: "Post comment fetch" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Get(":idx/comments")
	findComments(
		@Param("idx", ParseUUIDPipe) index: string,
	): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Post()
	async createPost(
		@Body() dto: CreatePostDto,
		@LoggedInUser() author: UserEntity,
	) {
		return this.postService.createOne(dto, author);
	}

	@ApiOperation({ summary: "Post edit" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Put(":idx")
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditPostDto,
	): Observable<PostEntity> {
		return this.postService.editOne(index, dto);
	}

	@ApiOperation({ summary: "Post delete" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Delete(":idx")
	deleteOne(
		@Param("idx", ParseUUIDPipe) index: string,
	): Observable<PostEntity> {
		return this.postService.deleteOne(index);
	}

	@ApiOperation({ summary: "Post comment create" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Post(":idx/comments")
	async createComment(
		@LoggedInUser("id") user: string,
		@Param("idx", ParseUUIDPipe) index: string,
		@Body("comment") commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	@ApiOperation({ summary: "Post comment delete" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Delete(":idx/comments")
	deleteComment(@Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.deleteComment(index);
	}

	@ApiOperation({ summary: "Post favorite" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Post(":idx/favorite")
	favorite(
		@LoggedInUser("id") userId: string,
		@Param("idx", ParseUUIDPipe) index: string,
	) {
		return this.postService.favorite(userId, index);
	}

	@ApiOperation({ summary: "Post remove favorite" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Post does not exist.",
	})
	@Delete(":idx/favorite")
	async unFavorite(
		@LoggedInUser("id") userId: string,
		@Param("idx", ParseUUIDPipe) index: string,
	) {
		return this.postService.unFavorite(userId, index);
	}
}
