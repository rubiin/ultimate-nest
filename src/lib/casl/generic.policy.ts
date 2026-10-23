import { Action } from "@common/@types";

import { AppAbility, Subjects } from "./casl-ability.factory";
import { PoliciesHandler, SubjectLookup, SubjectResolver } from "./policy.interface";

export class GenericPolicyHandler implements PoliciesHandler {
  constructor(
    private readonly ClassType: any,
    private readonly action: Action = Action.Read,
    private readonly lookup?: SubjectLookup,
  ) {}

  /* `Create`/`Read` rules are unconditional, so a class subject cannot widen access.
     `Delete` must never be answered from the class: CASL treats a class as type-only
     and drops its conditions, which let any author delete any row (C1). */
  async handle(request: NestifyRequest, ability: AppAbility, resolve?: SubjectResolver) {
    if (this.action === Action.Delete) {
      // A `Delete` wired without a lookup denies rather than falling back to the class.
      if (!this.lookup || !resolve) return false;

      const value = request.params[this.lookup.param];

      // Route params can be `string | string[]`; only a scalar identifier can name a row.
      if (typeof value !== "string" || !value) return false;

      // A missing row is denied: there is nothing to authorize the delete against.
      const document = await resolve(this.ClassType, value, this.lookup.field);

      if (!document) return false;

      return ability.can(this.action, document as Subjects);
    }

    if (this.action === Action.Update) {
      // Use the same instance lookup as `Delete` when the route named one, so the
      // ownership condition is evaluated against real fields instead of `{ id }`.
      if (this.lookup && resolve) {
        const value = request.params[this.lookup.param];

        if (typeof value !== "string" || !value) return false;

        const document = await resolve(this.ClassType, value, this.lookup.field);

        if (!document) return false;

        return ability.can(this.action, document as Subjects);
      }

      const id = request.params.id;

      return ability.can(Action.Update, new this.ClassType({ id }));
    }

    return ability.can(this.action, this.ClassType);
  }
}
