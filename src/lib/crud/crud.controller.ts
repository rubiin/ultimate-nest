import type { Crud, PaginationRequest, PaginationResponse } from "@common/@types";
import type { BaseEntity } from "@common/database";
import { ApiPaginatedResponse, LoggedInUser, SwaggerResponse } from "@common/decorators";
import { AppUtils } from "@common/helpers";
import { User } from "@entities";
import type { EntityDTO, FromEntityType, RequiredEntityData } from "@mikro-orm/postgresql";
import type { ArgumentMetadata, Type } from "@nestjs/common";
import { Body, Delete, Get, Injectable, Param, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { Observable } from "rxjs";
import type { BaseService } from "./crud.service";

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(private readonly targetTypes: { body?: Type, query?: Type, param?: Type }) {
    super(AppUtils.validationPipeOptions());
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    // @ts-expect-error "metatype" is a private property
    const targetType = this.targetTypes[metadata.type] as Type;

    if (!targetType)
      return super.transform(value, metadata);

    return super.transform(value, { ...metadata, metatype: targetType });
  }
}

/**
 * Factory function that creates a controller class that implements the Crud interface
 * @param queryDto - The query dto type
 * @param createDto - The create dto type
 * @param updateDto - The update dto type
 * @returns A controller class that implements the Crud interface
 */
export function ControllerFactory<
    T extends BaseEntity,
    Q extends PaginationRequest,
    C extends RequiredEntityData<T>,
    U extends Partial<EntityDTO<FromEntityType<T>>> ,
>(queryDto: Type<Q>, createDto: Type<C>, updateDto: Type<U>): Type<Crud<T, Q, C, U>> {
  const createPipe = new AbstractValidationPipe({
    body: createDto,
  });
  const updatePipe = new AbstractValidationPipe({
    body: updateDto,
  });

  const queryPipe = new AbstractValidationPipe({ query: queryDto });

  class CrudController<
        T extends BaseEntity,
        Q extends PaginationRequest,
        C extends RequiredEntityData<T>,
        U extends Partial<EntityDTO<FromEntityType<T>>>,
    > implements Crud<T, Q, C, U> {
    protected service!: BaseService<T, Q, C, U>;

    @Get(":idx")
    @SwaggerResponse({
      operation: "Find item",
      badRequest: "Item does not exist.",
      params: ["idx"],
    })
    findOne(@Param("idx") index: string): Observable<T> {
      return this.service.findOne(index);
    }

    @ApiPaginatedResponse(updateDto)
    @UsePipes(queryPipe)
    @Get()
    findAll(@Query() query: Q): Observable<PaginationResponse<T>> {
      return this.service.findAll(query);
    }

    @SwaggerResponse({
      operation: "Create item",
      badRequest: "Item already exists.",
      body: createDto,
      response: updateDto,
    })
    @UsePipes(createPipe)
    @Post()
    create(@Body() body: C, @LoggedInUser() user?: User): Observable<T> {
      return this.service.create(body, user);
    }

    @SwaggerResponse({
      operation: "Item update",
      badRequest: "Item does not exist.",
      params: ["idx"],
      body: updateDto,
      response: updateDto,
    })
    @UsePipes(updatePipe)
    @Put(":idx")
    update(@Param("idx") index: string, @Body() body: U): Observable<T> {
      return this.service.update(index, body);
    }

    @SwaggerResponse({
      operation: "Item delete",
      badRequest: "Item does not exist.",
      params: ["idx"],
      response: updateDto,
    })
    @Delete(":idx")
    remove(@Param("idx") index: string): Observable<T> {
      return this.service.remove(index);
    }
  }

  return CrudController;
}
