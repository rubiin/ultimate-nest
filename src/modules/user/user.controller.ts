import { PageOptionsDto } from "@common/classes/pagination";
import {
	ApiFile,
	ApiPaginatedResponse,
	GenericController,
	Public,
	SwaggerResponse,
	UUIDParam,
} from "@common/decorators";
import { fileValidatorPipe } from "@common/misc";
import { Roles } from "@common/types/enums";
import { User } from "@entities";
import { Action, CheckPolicies, GenericPolicyHandler, UpdateUserPolicyHandler } from "@lib/casl";
import { Pagination } from "@lib/pagination";
import { Body, Delete, Get, Post, Put, Query, UploadedFile } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@GenericController("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiPaginatedResponse(User, "Users list")
	@Get()
	getMany(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<User>> {
		return this.userService.getMany(pageOptionsDto);
	}

	@Public()
	@Post("register")
	@SwaggerResponse({
		operation: "Create user",
		badRequest: "User already registered with email.",
	})
	@ApiFile("avatar")
	async publicRegistration(
		@Body() dto: UserRegistrationDto,
		@UploadedFile(fileValidatorPipe({}))
		image: Express.Multer.File,
	) {
		return this.userService.createOne({
			...dto,
			roles: [Roles.AUTHOR],
			image,
		});
	}

	@Get(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		notFound: "User does not exist.",
		param: "idx",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Read))
	getOne(@UUIDParam("idx") index: string): Observable<User> {
		return this.userService.getOne(index);
	}

	@Post()
	@SwaggerResponse({
		operation: "User fetch",
		badRequest: "User already registered with email.",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Create))
	@ApiFile("avatar")
	async createOne(
		@Body() dto: CreateUserDto,
		@UploadedFile(fileValidatorPipe({}))
		image: Express.Multer.File,
	) {
		return this.userService.createOne({ ...dto, image });
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		badRequest: "User already registered with email.",
		notFound: "User does not exist.",
		param: "idx",
	})
	@CheckPolicies(new UpdateUserPolicyHandler())
	editOne(@UUIDParam("idx") index: string, @Body() dto: EditUserDto): Observable<User> {
		return this.userService.editOne(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		notFound: "User does not exist.",
		param: "idx",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Delete))
	deleteOne(@UUIDParam("idx") index: string): Observable<User> {
		return this.userService.deleteOne(index);
	}
}
