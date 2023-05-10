import { BaseEntity } from "@common/database";
import { SearchDto } from "@common/dtos/search.dto";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { Observable } from "rxjs";

import { PaginationClass } from "../pagination.class";

/**
 * common interface that enforces common methods for controller and service
 */
export interface ICrud<
	Entity extends BaseEntity = BaseEntity,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> {
	findAll(query: SearchDto): Observable<PaginationClass<Entity>>;
	findOne(index: string): Observable<Entity>;

	create(body: CreateDto, user?: User): Observable<Entity>;

	update(index: string, body: UpdateDto): Observable<Entity>;

	remove(index: string): Observable<Entity>;
}
