import { PageOptionsDto } from "@common/classes/pagination";
import { AppResource, AppRoles } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { User as UserEntity } from "@entities";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { omit } from "@rubiin/js-utils";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@ApiTags("Users routes")
@Controller("user")
export class UserController {
	constructor(
		private readonly userService: UserService,
		@InjectRolesBuilder()
		private readonly rolesBuilder: RolesBuilder,
	) {}

	@ApiOperation({ summary: "Users list" })
	@Get()
	async getMany(@Query() pageOptionsDto: PageOptionsDto) {
		const data = await this.userService.getMany(pageOptionsDto);

		return { data };
	}

	@ApiOperation({ summary: "public registration" })
	@Post("register")
	async publicRegistration(@Body() dto: UserRegistrationDto) {
		return this.userService.createOne({
			...dto,
			roles: [AppRoles.AUTHOR],
		});
	}

	@ApiOperation({ summary: "User fetch" })
	@Get(":id")
	async getOne(@Param("id") id: number) {
		return this.userService.getOne(id);
	}

	@ApiOperation({ summary: "Admin create user" })
	@Auth({
		possession: "any",
		action: "create",
		resource: AppResource.USER,
	})
	@Post()
	async createOne(@Body() dto: CreateUserDto) {
		return this.userService.createOne(dto);
	}

	@ApiOperation({ summary: "Edit user" })
	@Auth({
		possession: "own",
		action: "update",
		resource: AppResource.USER,
	})
	@Put(":id")
	async editOne(
		@Param("id") id: number,
		@Body() dto: EditUserDto,
		@LoggedInUser() user: UserEntity,
	) {
		let data: any;

		if (
			this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
				.granted
		) {
			data = await this.userService.editOne(id, dto);
		} else {
			const rest = omit(dto, ["roles"]);

			data = await this.userService.editOne(id, rest, user);
		}

		return data;
	}

	@ApiOperation({ summary: "User delete" })
	@Auth({
		action: "delete",
		possession: "own",
		resource: AppResource.USER,
	})
	@Delete(":id")
	async deleteOne(@Param("id") id: number, @LoggedInUser() user: UserEntity) {
		return this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
			.granted
			? this.userService.deleteOne(id)
			: this.userService.deleteOne(id, user);
	}
}
