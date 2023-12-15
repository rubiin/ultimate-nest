import { Action } from "@common/@types";
import type { AppAbility } from "./casl-ability.factory";
import type { PoliciesHandler } from "./policy.interface";

export class GenericPolicyHandler implements PoliciesHandler {
  constructor(
    private readonly ClassType: any,
    private readonly action: Action = Action.Read,
  ) {}

  handle(request: NestifyRequest, ability: AppAbility) {
    /* Checking if the action is Create, Read, or Delete. If it is, it will return the
            ability.can(this.action, this.type) method. If it is not, it will return the
            ability.can(Action.Update, new this.type({ id })) method. */

    if ([Action.Create, Action.Read, Action.Delete].includes(this.action))

      // eslint-disable-next-line ts/no-unsafe-argument
      return ability.can(this.action, this.ClassType);

    const id = request.params.id;

    // eslint-disable-next-line ts/no-unsafe-argument, ts/no-unsafe-call
    return ability.can(Action.Update, new this.ClassType({ id }));
  }
}
