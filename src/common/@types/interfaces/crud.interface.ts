import { BaseEntity } from "@common/database";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import { Observable } from "rxjs";

import { PaginationRequest, PaginationResponse } from "../types";

/**
 * common interface that enforces common methods for controller and service
 */
export interface ICrud<
	Entity extends BaseEntity,
	paginationRequest extends PaginationRequest,
	CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
	UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> {
	findAll(query: paginationRequest): Observable<PaginationResponse<Entity>>;
	findOne(index: string): Observable<Entity>;

	create(body: CreateDto, user?: User): Observable<Entity>;

	update(index: string, body: UpdateDto): Observable<Entity>;

	remove(index: string): Observable<Entity>;
}
