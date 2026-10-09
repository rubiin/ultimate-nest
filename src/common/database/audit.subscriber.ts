import { AuditAction } from "@common/@types";
import { AuditLog, OtpLog, RefreshToken } from "@entities";
import {
  ChangeSet,
  ChangeSetType,
  EntityMetadata,
  EventSubscriber,
  FlushEventArgs,
} from "@mikro-orm/postgresql";

import { getAuditActor } from "./audit.context";
import { EncryptedType } from "./mikro-orm.encrypted";

export const REDACTED = "[REDACTED]";

/** Sensitive columns that are not `hidden`, so the metadata check alone would miss them. */
const SENSITIVE_PROPERTIES = new Set(["password", "twoFactorSecret"]);

const ACTIONS: Record<ChangeSetType, AuditAction> = {
  [ChangeSetType.CREATE]: AuditAction.CREATE,
  [ChangeSetType.UPDATE]: AuditAction.UPDATE,
  [ChangeSetType.UPDATE_EARLY]: AuditAction.UPDATE,
  [ChangeSetType.DELETE]: AuditAction.DELETE,
  [ChangeSetType.DELETE_EARLY]: AuditAction.DELETE,
};

/**
 * Writes an `AuditLog` row for every created, updated or deleted entity. The rows are added to
 * the flush being committed, so they land in the same transaction as the change they describe.
 */
export class AuditSubscriber implements EventSubscriber {
  onFlush({ em, uow }: FlushEventArgs): void {
    const actor = getAuditActor();

    for (const changeSet of uow.getChangeSets()) {
      if (isExcluded(changeSet.meta)) continue;

      const action = ACTIONS[changeSet.type];
      const changes = describeChanges(action, changeSet);

      if (changes && Object.keys(changes).length === 0) continue;

      const log = em.create(
        AuditLog,
        {
          action,
          entityName: changeSet.meta.className,
          entityId: entityIdOf(changeSet),
          changes,
          ...actor,
        },
        { persist: false },
      );

      uow.computeChangeSet(log);
    }
  }
}

function isExcluded(meta: EntityMetadata): boolean {
  return (
    meta.pivotTable === true ||
    meta.class === AuditLog ||
    meta.class === RefreshToken ||
    meta.class === OtpLog
  );
}

function entityIdOf(changeSet: ChangeSet<object>): string {
  const { idx } = changeSet.entity as { idx?: string };

  return idx ?? changeSet.getSerializedPrimaryKey() ?? "";
}

function describeChanges(
  action: AuditAction,
  { meta, payload, originalEntity }: ChangeSet<object>,
): Record<string, unknown> | null {
  if (action === AuditAction.DELETE) return null;

  const changes: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    const mask = (raw: unknown) => (isSensitive(meta, key) ? REDACTED : raw);
    const old = originalEntity?.[key as keyof typeof originalEntity] ?? null;

    changes[key] =
      action === AuditAction.CREATE ? mask(value) : { old: mask(old), new: mask(value) };
  }

  return changes;
}

function isSensitive(meta: EntityMetadata, key: string): boolean {
  const property = meta.properties[key as keyof typeof meta.properties];

  return (
    SENSITIVE_PROPERTIES.has(key) ||
    property?.hidden === true ||
    property?.customType instanceof EncryptedType
  );
}
