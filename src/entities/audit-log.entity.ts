import { AuditAction } from "@common/@types";
import { Entity, Enum, Index, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { Opt } from "@mikro-orm/postgresql";

/**
 * One row per created, updated or deleted entity, written by `AuditSubscriber` in the same
 * flush as the change itself. Deliberately not a `BaseEntity`: audit rows are append-only and
 * must never be hidden by the `softDelete` filter.
 */
@Entity()
@Index({ properties: ["entityName", "entityId"] })
export class AuditLog {
  @PrimaryKey()
  id!: number;

  @Enum({ items: () => AuditAction })
  action!: AuditAction;

  @Property()
  entityName!: string;

  /**
   * The entity's public `idx` (its numeric primary key is not assigned until the insert runs).
   */
  @Property()
  entityId!: string;

  /**
   * `{ field: { old, new } }` for updates, the inserted payload for creates, `null` for deletes.
   */
  @Property({ type: "json", nullable: true })
  changes: Record<string, unknown> | null = null;

  @Property({ nullable: true })
  actorId: number | null = null;

  @Property({ nullable: true })
  ip: string | null = null;

  @Property({ nullable: true })
  requestId: string | null = null;

  @Property()
  createdAt: Date & Opt = new Date();
}
