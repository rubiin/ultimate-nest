import { PageOptionsDto } from "@common/classes/pagination";
import { AppResource, AppRoles } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ImageMulterOption } from "@common/misc/misc";
import { ParseFilePipe } from "@common/pipes/parse-file.pipe";
import { User, User as UserEntity } from "@entities";
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
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { omit } from "@rubiin/js-utils";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { Observable } from "rxjs";
import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@ApiTags("Users routes")
@UseInterceptors(CacheInterceptor)
@Controller("user")
export class UserController {
	constructor(
		private readonly userService: UserService,
		@InjectRolesBuilder()
		private readonly rolesBuilder: RolesBuilder,
	) {}

	@ApiOperation({ summary: "Users list" })
	@UseGuards(JwtAuthGuard)
	@Get()
	getMany(
		@Query() pageOptionsDto: PageOptionsDto,
	): Observable<Pagination<User>> {
		return this.userService.getMany(pageOptionsDto);
	}

	@ApiOperation({ summary: "public registration" })
	@UseInterceptors(FileInterceptor("avatar", ImageMulterOption))
	@Post("register")
	async publicRegistration(
		@UploadedFile(ParseFilePipe) image: Express.Multer.File,
		@Body() dto: UserRegistrationDto,
	) {
		return this.userService.createOne({
			...dto,
			roles: [AppRoles.AUTHOR],
			image,
		});
	}

	@ApiOperation({ summary: "User fetch" })
	@Get(":idx")
	getOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.getOne(index);
	}

	@ApiOperation({ summary: "Admin create user" })
	@Auth({
		possession: "any",
		action: "create",
		resource: AppResource.USER,
	})
	@UseInterceptors(FileInterceptor("avatar", ImageMulterOption))
	@Post()
	async createOne(
		@UploadedFile(ParseFilePipe) image: Express.Multer.File,
		@Body() dto: CreateUserDto,
	) {
		return this.userService.createOne({ ...dto, image });
	}

	@ApiOperation({ summary: "Edit user" })
	@Auth({
		possession: "own",
		action: "update",
		resource: AppResource.USER,
	})
	@Put(":idx")
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditUserDto,
		@LoggedInUser() user: UserEntity,
	): Observable<User> {
		return this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
			.granted
			? this.userService.editOne(index, dto)
			: this.userService.editOne(index, omit(dto, ["roles"]), user);
	}

	@ApiOperation({ summary: "User delete" })
	@Auth({
		action: "delete",
		possession: "own",
		resource: AppResource.USER,
	})
	@Delete(":idx")
	deleteOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@LoggedInUser() user: UserEntity,
	): Observable<User> {
		return this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
			.granted
			? this.userService.deleteOne(index)
			: this.userService.deleteOne(index, user);
	}
}
