import {
	Controller,
	Get,
	Param,
	Post,
	Put,
	Delete,
	Body,
	ParseIntPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { PostService } from "./post.service";
import { CreatePostDto, EditPostDto } from "./dtos";
import { Auth } from "@common/decorators/auth.decorator";
import { User as UserEntity } from "@entities";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { AppResource } from "@common/constants/app.roles";
import { I18n, I18nContext } from "nestjs-i18n";

@ApiTags("Posts")
@Controller("post")
export class PostController {
	constructor(
		private readonly postService: PostService,
		@InjectRolesBuilder()
		private readonly roleBuilder: RolesBuilder,
	) {}

	@Get()
	async getMany() {
		const data = await this.postService.getMany();

		return { data };
	}

	@Get(":id")
	async getById(@Param("id", ParseIntPipe) id: number) {
		const data = await this.postService.getById(id);

		return { data };
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
		@I18n() i18n: I18nContext,
	) {
		const data = await this.postService.createOne(dto, author);

		return { message: i18n.t("operations.POST_CREATED"), data };
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
		@I18n() i18n: I18nContext,
	) {
		const data = await (this.roleBuilder
			.can(author.roles)
			.updateAny(AppResource.POST).granted
			? this.postService.editOne(id, dto)
			: this.postService.editOne(id, dto, author));

		return { message: i18n.t("operations.POST_EDITED"), data };
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
		@I18n() i18n: I18nContext,
	) {
		const data = await (this.roleBuilder
			.can(author.roles)
			.deleteAny(AppResource.POST).granted
			? this.postService.deleteOne(id)
			: this.postService.deleteOne(id, author));

		return { message: i18n.t("operations.POST_DELETED"), data };
	}
}
