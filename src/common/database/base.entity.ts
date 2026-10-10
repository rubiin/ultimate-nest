import { randomUUID } from "node:crypto";

import { HelperService } from "@common/helpers";
import { Entity, Filter, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ApiHideProperty } from "@nestjs/swagger";
/**
 * Base entity class for mikroorm models, that all other entities of the same type should extend.
 */
@Entity({ abstract: true })
// Soft deletes are enforced by the ORM rather than by repeating `isDeleted: false`
// in every query. Declared here so that all subclasses inherit it.
@Filter({ name: "softDelete", cond: { isDeleted: false }, default: true })
export abstract class BaseEntity {
  @ApiHideProperty()
  @PrimaryKey({ hidden: true })
  id!: number;

  /**
   *  The unique id of the entity
   */
  @Property({ index: true })
  // Left in the initializer rather than a @BeforeCreate hook: audit.subscriber reads
  // `entity.idx` from its own beforeCreate, and hook ordering between the two is not
  // guaranteed, so the audit row could capture an undefined entityId.
  idx?: string = randomUUID();

  /**
   *  To enable or disable the entity
   */
  @Property()
  isActive? = true;

  /**
   *  Marked true when entity is soft deleted
   */
  @Property({ hidden: true, index: true })
  isDeleted? = false;

  /**
   *  The date that the entity was soft-deleted. Nullable because it's not set until the entity is soft-deleted.
   */
  @Property()
  deletedAt?: Date | null;

  /**
   *  The date that the entity was created
   */
  @Property()
  createdAt? = HelperService.getTimeInUtc(new Date());

  /**
   *  The date that the entity was last updated
   */
  @Property({
    onUpdate: () => HelperService.getTimeInUtc(new Date()),
    hidden: true,
  })
  updatedAt? = this.createdAt;
}
