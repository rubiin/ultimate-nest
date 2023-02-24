import { BaseEntity } from "@common/database";
import { LoggedInUser, UUIDParam } from "@common/decorators";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { User } from "@entities";
import { Pagination } from "@lib/pagination";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { Body, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { Observable } from "rxjs";
import { BaseService } from "./base.service";

export abstract class BaseController<
  T extends BaseEntity,
  CreateDto extends RequiredEntityData<T> = RequiredEntityData<T>,
  UpdateDto extends EntityData<T> = EntityData<T>,
> {
  constructor(private readonly service: BaseService<T>) { }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto): Observable<Pagination<T>> {
    return this.service.findAll(pageOptionsDto);
  }

  @Get(":idx")
  findOne(@UUIDParam("idx") index: string): Observable<T> {
    return this.service.findOne(index);
  }

  @Post()
  async create(@Body() dto: CreateDto, @LoggedInUser() author: User) {
    return this.service.create(dto, author);
  }

  @Put(":idx")
  update(@UUIDParam("idx") index: string, @Body() dto: UpdateDto): Observable<T> {
    return this.service.update(index, dto);
  }

  @Delete(":idx")
  remove(@UUIDParam("idx") index: string): Observable<T> {
    return this.service.remove(index);
  }
}
