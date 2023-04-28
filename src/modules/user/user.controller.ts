import { Action, IFile, Roles } from "@common/@types";
import {
	ApiFile,
	ApiPaginatedResponse,
	GenericController,
	Public,
	SwaggerResponse,
	UUIDParam,
} from "@common/decorators";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { fileValidatorPipe } from "@common/misc";
import { User } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl";
import { Pagination } from "@lib/pagination";
import { Body, Delete, Get, Post, Put, Query, UploadedFile } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@GenericController("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@ApiPaginatedResponse(User, "Users list")
	@Get()
	findAll(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<User>> {
		return this.userService.findAll(pageOptionsDto);
	}

	@Public()
	@Post("register")
	@SwaggerResponse({
		operation: "Create user",
		badRequest: "User already registered with email.",
	})
	@ApiFile({ fieldName: "avatar", required: true })
	publicRegistration(
		@Body() dto: UserRegistrationDto,
		@UploadedFile(fileValidatorPipe({}))
		image: IFile,
	): Observable<User> {
		return this.userService.create({
			...dto,
			roles: [Roles.AUTHOR],
			files: image,
		});
	}

	@Get(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		notFound: "User does not exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Read))
	findOne(@UUIDParam("idx") index: string): Observable<User> {
		return this.userService.findOne(index);
	}

	@Post()
	@SwaggerResponse({
		operation: "User fetch",
		badRequest: "User already registered with email.",
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Create))
	@ApiFile({ fieldName: "avatar", required: true })
	create(
		@Body() dto: CreateUserDto,
		@UploadedFile(fileValidatorPipe({}))
		image: IFile,
	): Observable<User> {
		return this.userService.create({ ...dto, files: image });
	}

	@Put(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		badRequest: "User already registered with email.",
		notFound: "User does not exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Update))
	update(@UUIDParam("idx") index: string, @Body() dto: EditUserDto): Observable<User> {
		return this.userService.update(index, dto);
	}

	@Delete(":idx")
	@SwaggerResponse({
		operation: "User fetch",
		notFound: "User does not exist.",
		params: ["idx"],
	})
	@CheckPolicies(new GenericPolicyHandler(User, Action.Delete))
	remove(@UUIDParam("idx") index: string): Observable<User> {
		return this.userService.remove(index);
	}
}
