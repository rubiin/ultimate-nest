import { PageOptionsDto } from "@common/classes/pagination";
import { AppResource } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { User as UserEntity } from "@entities";
import { Post as PostEntity } from "@entities";
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
import { CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@ApiTags("Posts")
@UseInterceptors(CacheInterceptor)
@Controller("post")
export class PostController {
	constructor(
		private readonly postService: PostService,
		@InjectRolesBuilder()
		private readonly roleBuilder: RolesBuilder,
	) {}

	@Auth({
		possession: "any",
		action: "read",
		resource: AppResource.POST,
	})
	@Get()
	getMany(
		@Query() pageOptionsDto: PageOptionsDto,
	): Observable<Pagination<PostEntity>> {
		return this.postService.getMany(pageOptionsDto);
	}

	@Get(":idx")
	async getById(@Param("idx", ParseUUIDPipe) index: string) {
		return await this.postService.getById(index);
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
	@Put(":id")
	async editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditPostDto,
		@LoggedInUser() author: UserEntity,
	) {
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
	@Delete(":id")
	async deleteOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@LoggedInUser() author: UserEntity,
	) {
		return this.roleBuilder.can(author.roles).deleteAny(AppResource.POST)
			.granted
			? this.postService.deleteOne(index)
			: this.postService.deleteOne(index, author);
	}
}
