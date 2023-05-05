import { BaseEntity } from "@common/database";
import { PaginationDto } from "@common/dtos/pagination.dto";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { Observable } from "rxjs";

import { Paginated } from "../pagination.class";

/**
 * common service interface that enforces common methods
 */
export interface IBaseService<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> {
	create(dto: CreateDto, user?: User): Promise<Entity> | Observable<Entity>;

	findAll(dto: PaginationDto): Observable<Paginated<Entity>>;

	findOne(index: string): Observable<Entity>;

	update(index: string, dto: UpdateDto): Observable<Entity>;

	remove(index: string): Observable<Entity>;
}
