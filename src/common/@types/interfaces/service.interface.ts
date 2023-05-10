import { BaseEntity } from "@common/database";
import { SearchDto } from "@common/dtos/search.dto";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { Observable } from "rxjs";

import { PaginationClass } from "../pagination.class";

/**
 * common service interface that enforces common methods
 */
export interface ICrudService<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> {
	create(dto: CreateDto, user?: User): Observable<Entity>;

	findAll(dto: SearchDto): Observable<PaginationClass<Entity>>;

	findOne(index: string): Observable<Entity>;

	update(index: string, dto: UpdateDto): Observable<Entity>;

	remove(index: string): Observable<Entity>;
}
