import { Action, PaginationResponse } from "@common/@types/index.js";
import {
  ApiPaginatedResponse,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
} from "@common/decorators/index.js";
import { CursorPaginationDto } from "@common/dtos/index.js";
import { Tag, User } from "@entities";
import { CheckPolicies, GenericPolicyHandler } from "@lib/casl/index.js";
import { AbstractValidationPipe } from "@lib/crud/crud.controller.js";
import { Body, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { Observable } from "rxjs";

import { CreateTagDto, EditTagDto } from "./dto/index.js";
import { TagsService } from "./tags.service.js";

const ADMIN_ONLY = "Admin role required.";

@GenericController("tags")
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get(":idx")
  @SwaggerResponse({
    notFound: "Item does not exist.",
    operation: "Find item",
    params: ["idx"],
  })
  findOne(@Param("idx") index: string): Observable<Tag> {
    return this.service.findOne(index);
  }

  @ApiPaginatedResponse(EditTagDto)
  @UsePipes(new AbstractValidationPipe({ query: CursorPaginationDto }))
  @Get()
  findAll(@Query() query: CursorPaginationDto): Observable<PaginationResponse<Tag>> {
    return this.service.findAll(query);
  }

  @Post()
  @UsePipes(new AbstractValidationPipe({ body: CreateTagDto }))
  @SwaggerResponse({ badRequest: ADMIN_ONLY, operation: "Create tag" })
  @CheckPolicies(new GenericPolicyHandler(Tag, Action.Create))
  create(@Body() body: CreateTagDto, @LoggedInUser() user?: User): Observable<Tag> {
    return this.service.create(body, user);
  }

  @Patch(":idx")
  @UsePipes(new AbstractValidationPipe({ body: EditTagDto }))
  @SwaggerResponse({ badRequest: ADMIN_ONLY, operation: "Update tag", params: ["idx"] })
  @CheckPolicies(new GenericPolicyHandler(Tag, Action.Update, { field: "idx", param: "idx" }))
  update(@Param("idx") index: string, @Body() body: EditTagDto): Observable<Tag> {
    return this.service.update(index, body);
  }

  @Delete(":idx")
  @SwaggerResponse({ badRequest: ADMIN_ONLY, operation: "Delete tag", params: ["idx"] })
  @CheckPolicies(new GenericPolicyHandler(Tag, Action.Delete, { field: "idx", param: "idx" }))
  remove(@Param("idx") index: string): Observable<Tag> {
    return this.service.remove(index);
  }
}
