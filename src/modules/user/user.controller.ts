import { PageOptionsDto } from "@common/classes/pagination";
import { ApiFile, Auth } from "@common/decorators";
import { ParseFilePipe } from "@common/pipes/parse-file.pipe";
import { ApiPaginatedResponse } from "@common/swagger/ApiPaginated";
import { Roles } from "@common/types/enums";
import { User } from "@entities";
import { CheckPolicies } from "@lib/casl/policies.decorator";
import {
	CreateUserPolicyHandler,
	DeleteUserPolicyHandler,
	ReadUserPolicyHandler,
	UpdateUserPolicyHandler,
} from "@lib/casl/policies/user";
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
	UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Observable } from "rxjs";
import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@ApiTags("Users")
@Auth()
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
	@ApiFile("avatar")
	@CheckPolicies(new CreateUserPolicyHandler())
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
		name: "idx",
		required: true,
	})
	@CheckPolicies(new ReadUserPolicyHandler())
	@Get(":idx")
	getOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.getOne(index);
	}

	@ApiOperation({ summary: "Admin create user" })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "User already registered with email.",
	})
	@CheckPolicies(new CreateUserPolicyHandler())
	@Throttle(10, 3600)
	@ApiFile("avatar")
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
		name: "idx",
		required: true,
	})
	@CheckPolicies(new UpdateUserPolicyHandler())
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
		name: "idx",
		required: true,
	})
	@CheckPolicies(new DeleteUserPolicyHandler())
	@Delete(":idx")
	deleteOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.deleteOne(index);
	}
}
