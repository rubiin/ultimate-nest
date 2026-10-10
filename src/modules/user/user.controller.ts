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
import { Observable } from "rxjs";

import { CreateUserDto, EditUserDto, ReferUserDto, UserRegistrationDto } from "./dtos";
import { UserService } from "./user.service";

@GenericController("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("refer")
  @SwaggerResponse({
    badRequest: "User already registered with email.",
    operation: "User Refer",
  })
  referUser(@Body() dto: ReferUserDto, @LoggedInUser() user: User) {
    return this.userService.referUser(dto, user);
  }

  @Public()
  @ApiPaginatedResponse(User)
  @Get()
  findAll(@Query() PaginationDto: CursorPaginationDto): Observable<PaginationResponse<User>> {
    return this.userService.findAll(PaginationDto);
  }

  @Public()
  @Post("register")
  @SwaggerResponse({
    badRequest: "User already registered with email.",
    operation: "Create user",
  })
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
    notFound: "User does not exist.",
    operation: "User fetch",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Read))
  findOne(@UUIDParam("idx") index: string): Observable<User> {
    return this.userService.findOne(index);
  }

  @Post()
  @SwaggerResponse({
    badRequest: "User already registered with email.",
    operation: "User create",
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Create))
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
    badRequest: "User already registered with email.",
    notFound: "User does not exist.",
    operation: "User edit",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Update))
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
    notFound: "User does not exist.",
    operation: "User delete",
    params: ["idx"],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.Delete))
  remove(@UUIDParam("idx") index: string): Observable<User> {
    return this.userService.remove(index);
  }
}
