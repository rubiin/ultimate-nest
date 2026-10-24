import type { File } from "@common/@types";
import { PaginationResponse } from "@common/@types";
import { Action, Roles } from "@common/@types";
import {
  ApiFile,
  ApiPaginatedResponse,
  GenericController,
  LoggedInUser,
  Public,
  SwaggerResponse,
  UUIDParam,
} from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import { fileValidatorPipe } from "@common/misc";
import { User } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl";
import { Body, Delete, Get, Put as Patch, Post, Query, UploadedFile } from "@nestjs/common";
import { Resilience } from "@nestjs/resilience";
import { Observable } from "rxjs";

import { CreateUserDto, EditUserDto, ReferUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

const USER_NOT_FOUND = "User does not exist.";
const EMAIL_ALREADY_REGISTERED = "User already registered with email.";

@GenericController("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("refer")
  @SwaggerResponse({
    badRequest: EMAIL_ALREADY_REGISTERED,
    operation: "User Refer",
  })
  referUser(@Body() dto: ReferUserDto, @LoggedInUser() user: User) {
    return this.userService.referUser(dto, user);
  }

  @ApiPaginatedResponse(User)
  @Get()
  @CheckPolicies(new GenericPolicyHandler(User, Action.Read))
  findAll(@Query() PaginationDto: CursorPaginationDto): Observable<PaginationResponse<User>> {
    return this.userService.findAll(PaginationDto);
  }

  @Public()
  @Post("register")
  @SwaggerResponse({
    badRequest: EMAIL_ALREADY_REGISTERED,
    operation: "Create user",
  })
  // No `@Retry()`: this writes a user and an OTP, so a second attempt inside one
  // request would duplicate rows. The timeout and breaker still apply, which is
  // what matters here - a stalled upload must not hold the request open.
  @Resilience("cloudinary")
  @ApiFile({ fieldName: "avatar", required: true }) // fix this
  publicRegistration(
    @Body() dto: UserRegistrationDto,
    @UploadedFile(fileValidatorPipe({}))
    image: File,
  ): Observable<User> {
    return this.userService.create({
      ...dto,
      files: image,
      roles: [Roles.AUTHOR],
    });
  }

  @Get(":idx")
  @SwaggerResponse({
    notFound: USER_NOT_FOUND,
    operation: "User fetch",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Read))
  findOne(@UUIDParam("idx") index: string): Observable<User> {
    return this.userService.findOne(index);
  }

  @Post()
  @SwaggerResponse({
    badRequest: EMAIL_ALREADY_REGISTERED,
    operation: "User create",
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Create))
  @Resilience("cloudinary")
  @ApiFile({ fieldName: "avatar", required: true })
  create(
    @Body() dto: CreateUserDto,
    @UploadedFile(fileValidatorPipe({}))
    image: File,
  ): Observable<User> {
    return this.userService.create({ ...dto, files: image });
  }

  @Patch(":idx")
  @SwaggerResponse({
    notFound: USER_NOT_FOUND,
    operation: "User edit",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Update, { param: "idx", field: "idx" }))
  @Resilience("cloudinary")
  update(
    @UUIDParam("idx") index: string,
    @Body()
    dto: EditUserDto,
    @UploadedFile(fileValidatorPipe({ required: false }))
    image?: File,
  ): Observable<User> {
    return this.userService.update(index, dto, image);
  }

  @Delete(":idx")
  @SwaggerResponse({
    notFound: USER_NOT_FOUND,
    operation: "User delete",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Delete, { param: "idx", field: "idx" }))
  remove(@UUIDParam("idx") index: string): Observable<User> {
    return this.userService.remove(index);
  }
}
