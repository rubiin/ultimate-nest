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

	@Get(":id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		return await this.postService.getById(id);
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
		@Param("id") id: number,
		@Body() dto: EditPostDto,
		@LoggedInUser() author: UserEntity,
	) {
		return this.roleBuilder.can(author.roles).updateAny(AppResource.POST)
			.granted
			? this.postService.editOne(id, dto)
			: this.postService.editOne(id, dto, author);
	}

	@Auth({
		resource: AppResource.POST,
		action: "delete",
		possession: "own",
	})
	@Delete(":id")
	async deleteOne(
		@Param("id") id: number,
		@LoggedInUser() author: UserEntity,
	) {
		return this.roleBuilder.can(author.roles).deleteAny(AppResource.POST)
			.granted
			? this.postService.deleteOne(id)
			: this.postService.deleteOne(id, author);
	}
}
