import { PageOptionsDto } from "@common/classes/pagination";
import { ApiFile, Public, SwaggerDecorator } from "@common/decorators";
import { ControllerDecorator } from "@common/decorators/controller.decorator";
import { ParseFilePipe } from "@common/pipes/parse-file.pipe";
import { ApiPaginatedResponse } from "@common/swagger/ApiPaginated";
import { Roles } from "@common/types/enums";
import { User } from "@entities";
import { Action, GenericPolicyHandler, UpdateUserPolicyHandler } from "@lib/casl";
import { CheckPolicies } from "@lib/casl/policies.decorator";
import { Pagination } from "@lib/pagination";
import {
	Body,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	UploadedFile,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@ControllerDecorator("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: "Users list" })
	@ApiPaginatedResponse(User)
	@Get()
	getMany(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<User>> {
		return this.userService.getMany(pageOptionsDto);
	}

	@Public()
	@Post("register")
	@SwaggerDecorator({
		operation: "Create user",
		badRequest: "User already registered with email.",
	})
	@ApiFile("avatar")
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

	@Get(":idx")
	@SwaggerDecorator({
		operation: "User fetch",
		notFound: "User does not exist.",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Read))
	getOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.getOne(index);
	}

	@Post()
	@SwaggerDecorator({
		operation: "User fetch",
		badRequest: "User already registered with email.",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Create))
	@ApiFile("avatar")
	async createOne(
		@UploadedFile(ParseFilePipe) image: Express.Multer.File,
		@Body() dto: CreateUserDto,
	) {
		return this.userService.createOne({ ...dto, image });
	}

	@Put(":idx")
	@SwaggerDecorator({
		operation: "User fetch",
		badRequest: "User already registered with email.",
		notFound: "User does not exist.",
	})
	@CheckPolicies(new UpdateUserPolicyHandler())
	editOne(
		@Param("idx", ParseUUIDPipe) index: string,
		@Body() dto: EditUserDto,
	): Observable<User> {
		return this.userService.editOne(index, dto);
	}

	@Delete(":idx")
	@SwaggerDecorator({
		operation: "User fetch",
		notFound: "User does not exist.",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Delete))
	deleteOne(@Param("idx", ParseUUIDPipe) index: string): Observable<User> {
		return this.userService.deleteOne(index);
	}
}
