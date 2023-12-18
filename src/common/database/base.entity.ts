import { randomUUID } from "node:crypto";

import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { ApiHideProperty } from "@nestjs/swagger";
import { HelperService } from "@common/helpers";

/**
 * Base entity class for mikroorm models, that all other entities of the same type should extend.
 */
@Entity({ abstract: true })
export abstract class BaseEntity {
  @ApiHideProperty()
  @PrimaryKey({ hidden: true, index: true })
    id!: number;

  /**
   *  The unique id of the entity
   */
  @Property({ index: true })
    idx?: string = randomUUID();

  /**
   *  To enable or disable the entity
   */
  @Property()
    isActive? = true;

  /**
   *  Marked true when entity is soft deleted
   */
  @Property({ hidden: true })
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
    updatedAt? = HelperService.getTimeInUtc(new Date());
}
