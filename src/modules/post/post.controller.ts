import { PageOptionsDto } from "@common/classes/pagination";
import { AppResource } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { User as UserEntity } from "@entities";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { CreatePostDto, EditPostDto } from "./dtos";
import { PostService } from "./post.service";

@ApiTags("Posts")
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
	async getMany(@Query() pageOptionsDto: PageOptionsDto) {
		return this.postService.getMany(pageOptionsDto);
	}

	@Get(":idx")
	async getById(@Param("idx", ParseIntPipe) idx: string) {
		return await this.postService.getById(idx);
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
		@Param("idx", ParseUUIDPipe) idx: string,
		@Body() dto: EditPostDto,
		@LoggedInUser() author: UserEntity,
	) {
		return this.roleBuilder.can(author.roles).updateAny(AppResource.POST)
			.granted
			? this.postService.editOne(idx, dto)
			: this.postService.editOne(idx, dto, author);
	}

	@Auth({
		resource: AppResource.POST,
		action: "delete",
		possession: "own",
	})
	@Delete(":id")
	async deleteOne(
		@Param("idx", ParseUUIDPipe) idx: string,
		@LoggedInUser() author: UserEntity,
	) {
		return this.roleBuilder.can(author.roles).deleteAny(AppResource.POST)
			.granted
			? this.postService.deleteOne(idx)
			: this.postService.deleteOne(idx, author);
	}
}
