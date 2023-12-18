import type { Observable } from "rxjs";

import type { BaseEntity } from "@common/database";
import type { User } from "@entities";
import type { CreateEntityType, UpdateEntityType } from "../types/common.types";
import type {
  PaginationResponse,
  PaginationRequest as TPaginationRequest,
} from "./pagination.interface";

/**
 * common interface that enforces common methods for controller and service
 */
export interface Crud<
    Entity extends BaseEntity,
    PaginationRequest extends TPaginationRequest,
    CreateDto extends CreateEntityType<Entity> = CreateEntityType<Entity>,
    UpdateDto extends UpdateEntityType<Entity> = UpdateEntityType<Entity>,
> {
  findAll(query: PaginationRequest): Observable<PaginationResponse<Entity>>

  findOne(index: string): Observable<Entity>

  create(body: CreateDto, user?: User): Observable<Entity>

  update(index: string, body: UpdateDto): Observable<Entity>

  remove(index: string): Observable<Entity>
}
