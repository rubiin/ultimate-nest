import { PageOptionsDto } from "@common/classes/pagination";
import { AppResource } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { User as UserEntity, Post as PostEntity, Comment } from "@entities";
import { Pagination } from "@lib/pagination";
import {
	Body,
	CacheInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { Observable } from "rxjs";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@ApiTags("Posts")
@UseInterceptors(CacheInterceptor)
@Controller("posts")
export class PostController {
	constructor(
		private readonly postService: PostService,
		@InjectRolesBuilder()
		private readonly roleBuilder: RolesBuilder,
	) {}

	@Get()
	getMany(
		@Query() pageOptionsDto: PageOptionsDto,
	): Observable<Pagination<PostEntity>> {
		return this.postService.getMany(pageOptionsDto);
	}

	@Get(":idx")
	getById(
		@Param("idx", ParseUUIDPipe) index: string,
	): Observable<PostEntity> {
		return this.postService.getById(index);
	}

	@Get(":idx/comments")
	findComments(
		@Param("idx", ParseUUIDPipe) index: string,
	): Observable<Comment[]> {
		return this.postService.findComments(index);
	}

	@Auth({
		resource: AppResource.POST,
		action: "create",
		possession: "own",
	})
	@Post()
	async createPost(
		@Body() dto: CreatePostDto,
		@LoggedInUser() author: UserEntity,
	) {
		return this.postService.createOne(dto, author);
	}

	@Auth({
		resource: AppResource.POST,
		action: "update",
		possession: "own",
	})
	@Put(":idx")
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditPostDto,
		@LoggedInUser() author: UserEntity,
	): Observable<PostEntity> {
		return this.roleBuilder.can(author.roles).updateAny(AppResource.POST)
			.granted
			? this.postService.editOne(index, dto)
			: this.postService.editOne(index, dto, author);
	}

	@Auth({
		resource: AppResource.POST,
		action: "delete",
		possession: "own",
	})
	@Delete(":idx")
	deleteOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@LoggedInUser() author: UserEntity,
	): Observable<PostEntity> {
		return this.roleBuilder.can(author.roles).deleteAny(AppResource.POST)
			.granted
			? this.postService.deleteOne(index)
			: this.postService.deleteOne(index, author);
	}

	@Post(":idx/comments")
	async createComment(
		@LoggedInUser("id") user: number,
		@Param("idx", ParseUUIDPipe) index: string,
		@Body("comment") commentData: CreateCommentDto,
	) {
		return this.postService.addComment(user, index, commentData);
	}

	@Delete(":idx/comments")
	deleteComment(@Param("idx", ParseUUIDPipe) index: string) {
		return this.postService.deleteComment(index);
	}

	@Post(":idx/favorite")
	favorite(
		@LoggedInUser("id") userId: number,
		@Param("idx", ParseUUIDPipe) index: string,
	) {
		return this.postService.favorite(userId, index);
	}

	@Delete(":idx/favorite")
	async unFavorite(
		@LoggedInUser("id") userId: number,
		@Param("idx", ParseUUIDPipe) index: string,
	) {
		return this.postService.unFavorite(userId, index);
	}
}
