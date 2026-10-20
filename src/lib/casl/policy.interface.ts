import { EntityName } from "@mikro-orm/core";

import { AppAbility } from "./casl-ability.factory";

/** Route param carrying the row identifier, and the entity field to load that row by. */
export interface SubjectLookup {
  param: string;
  field: string;
}

/**
 * Loads the real row for an instance-level ability check. Supplied by the guard so a
 * `Delete` never has to answer from the entity class.
 */
export type SubjectResolver = (
  subject: EntityName<object>,
  value: string,
  field: string,
) => Promise<object | null>;

export interface PoliciesHandler {
  handle: (
    request: NestifyRequest,
    ability: AppAbility,
    resolve?: SubjectResolver,
  ) => boolean | Promise<boolean>;
}

type PolicyHandlerCallback = (
  request: NestifyRequest,
  ability: AppAbility,
  resolve?: SubjectResolver,
) => boolean | Promise<boolean>;

export type PolicyHandler = PoliciesHandler | PolicyHandlerCallback;
