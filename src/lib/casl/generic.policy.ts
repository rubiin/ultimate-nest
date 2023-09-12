/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Request } from "express";

import type { AppAbility } from "./casl-ability.factory";
import type { PoliciesHandler } from "./policy.interface";
import { Action } from "@common/@types";

export class GenericPolicyHandler implements PoliciesHandler {
  constructor(
    private readonly ClassType,
    private readonly action: Action = Action.Read,
  ) {}

  handle(request: Request, ability: AppAbility) {
    /* Checking if the action is Create, Read, or Delete. If it is, it will return the
            ability.can(this.action, this.type) method. If it is not, it will return the
            ability.can(Action.Update, new this.type({ id })) method. */

    if ([Action.Create, Action.Read, Action.Delete].includes(this.action))
      return ability.can(this.action, this.ClassType);

    const id = request.params.id;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return ability.can(Action.Update, new this.ClassType({ id }));
  }
}
