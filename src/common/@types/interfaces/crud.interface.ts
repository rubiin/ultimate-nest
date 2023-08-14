import type { EntityData, RequiredEntityData } from '@mikro-orm/core';
import type { Observable } from 'rxjs';
import type {
  PaginationResponse,
  PaginationRequest as TPaginationRequest,
} from './pagination.interface';

import type { User } from '@entities';
import type { BaseEntity } from '@common/database';

/**
* common interface that enforces common methods for controller and service
*/
export interface Crud<
Entity extends BaseEntity,
PaginationRequest extends TPaginationRequest,
CreateDto extends RequiredEntityData<Entity> = RequiredEntityData<Entity>,
UpdateDto extends EntityData<Entity> = EntityData<Entity>,
> {
  findAll(query: PaginationRequest): Observable<PaginationResponse<Entity>>;
  findOne(index: string): Observable<Entity>;

  create(body: CreateDto, user?: User): Observable<Entity>;

  update(index: string, body: UpdateDto): Observable<Entity>;

  remove(index: string): Observable<Entity>;
}
