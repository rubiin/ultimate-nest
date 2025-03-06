import  { BaseEntity } from "@common/database"

import  { User } from "@entities"
import  { Observable } from "rxjs"
import  { CreateEntityType, UpdateEntityType } from "../types/common.types"
import  {
  PaginationResponse,
  PaginationRequest as TPaginationRequest,
} from "./pagination.interface"

/**
 * common interface that enforces common methods for controller and service
 */
export interface Crud<
  Entity extends BaseEntity,
  PaginationRequest extends TPaginationRequest,
  CreateDto extends CreateEntityType<Entity>,
  UpdateDto extends UpdateEntityType<Entity> ,
> {
  findAll: (query: PaginationRequest) => Observable<PaginationResponse<Entity>>

  findOne: (index: string) => Observable<Entity>

  create: (dto: CreateDto, user?: User) => Observable<Entity>

  update: (index: string, dto: UpdateDto) => Observable<Entity>

  remove: (index: string) => Observable<Entity>
}
