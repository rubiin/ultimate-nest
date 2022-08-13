import { Action, AppAbility } from "../../casl-ability.factory";
import { Request } from "express";
import { User } from "@entities";
import { IPolicyHandler } from "../../IPolicyHandler";

export class UpdateUserPolicyHandler implements IPolicyHandler {
	handle(request: Request, ability: AppAbility) {
		const index = request.params.id;

		return ability.can(Action.Update, new User({ idx: index }));
	}
}
