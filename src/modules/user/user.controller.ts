import { PageOptionsDto } from "@common/classes/pagination";
import { ApiFile, Public, SwaggerDecorator,GenericController,ApiPaginatedResponse } from "@common/decorators";
import { fileValidatorPipe } from "@common/misc";
import { Roles } from "@common/types/enums";
import { User } from "@entities";
import { Action, GenericPolicyHandler, UpdateUserPolicyHandler,CheckPolicies } from "@lib/casl";
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
import { Observable } from "rxjs";

import { CreateUserDto, EditUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@GenericController("users")
export class UserController {
	constructor(private readonly userService: UserService) {}
	
	@ApiPaginatedResponse(User,"Users list"  )
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
		@Body() dto: CreateUserDto,
		@UploadedFile(fileValidatorPipe({}))
		image: Express.Multer.File,
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
