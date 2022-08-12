import { PageOptionsDto } from "@common/classes/pagination";
import { Permissions } from "@common/decorators/permission.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ImageMulterOption } from "@common/misc/misc";
import { UserHook } from "@common/permissions/user.hook";
import { ParseFilePipe } from "@common/pipes/parse-file.pipe";
import { ApiPaginatedResponse } from "@common/swagger/ApiPaginated";
import { Roles } from "@common/types/permission.enum";
import { User } from "@entities";
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
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AccessGuard, Actions } from "nest-casl";
import { Observable } from "rxjs";
import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@ApiTags("Users")
@UseGuards(JwtAuthGuard, AccessGuard)
@UseInterceptors(CacheInterceptor)
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: "Users list" })
	@ApiPaginatedResponse(User)
	@Get()
	getMany(
		@Query() pageOptionsDto: PageOptionsDto,
	): Observable<Pagination<User>> {
		return this.userService.getMany(pageOptionsDto);
	}

	@ApiOperation({ summary: "public registration" })
	@Throttle(10, 3600)
	@UseInterceptors(FileInterceptor("avatar", ImageMulterOption))
	@Post("register")
	async publicRegistration(
		@UploadedFile(ParseFilePipe) image: Express.Multer.File,
		@Body() dto: UserRegistrationDto,
	) {
		return this.userService.createOne({
			...dto,
			roles: [Roles.AUTHOR],
			image,
		});
	}

	@ApiOperation({ summary: "User fetch" })
	@ApiParam({
		name: "id",
		type: String,
		required: true,
		description: "id of the item",
	})
	@Get(":idx")
	getOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.getOne(index);
	}

	@ApiOperation({ summary: "Admin create user" })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "User already registered with email.",
	})
	@Permissions(Actions.delete, User)
	@Throttle(10, 3600)
	@UseInterceptors(FileInterceptor("avatar", ImageMulterOption))
	@Post()
	async createOne(
		@UploadedFile(ParseFilePipe) image: Express.Multer.File,
		@Body() dto: CreateUserDto,
	) {
		return this.userService.createOne({ ...dto, image });
	}

	@ApiOperation({ summary: "Edit user" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "User does not exist.",
	})
	@ApiParam({
		name: "id",
		type: String,
		required: true,
		description: "id of the item",
	})
	@Permissions(Actions.update, User, UserHook)
	@Put(":idx")
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditUserDto,
	): Observable<User> {
		return this.userService.editOne(index, dto);
	}

	@ApiOperation({ summary: "User delete" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "User does not exist.",
	})
	@ApiParam({
		name: "id",
		type: String,
		required: true,
		description: "id of the item",
	})
	@Permissions(Actions.delete, User, UserHook)
	@Delete(":idx")
	deleteOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.deleteOne(index);
	}
}
