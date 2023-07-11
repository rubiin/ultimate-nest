import { Action } from "@common/@types";
import { Request } from "express";

import { AppAbility } from "./casl-ability.factory";
import { PoliciesHandler } from "./policy.interface";

export class GenericPolicyHandler implements PoliciesHandler {
	constructor(
		private readonly type: any,
		private readonly action: Action = Action.Read,
	) {}

	handle(request: Request, ability: AppAbility) {
		/* Checking if the action is Create, Read, or Delete. If it is, it will return the
        ability.can(this.action, this.type) method. If it is not, it will return the
        ability.can(Action.Update, new this.type({ id })) method. */

		if ([Action.Create, Action.Read, Action.Delete].includes(this.action)) {
			return ability.can(this.action, this.type);
		}

		const id = request.params.id;

		return ability.can(Action.Update, new this.type({ id }));
	}
}
