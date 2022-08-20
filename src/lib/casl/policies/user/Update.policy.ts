import { User } from "@entities";
import { Request } from "express";
import { Action, AppAbility } from "../../casl-ability.factory";
import { IPolicyHandler } from "../../IPolicyHandler";

export class UpdateUserPolicyHandler implements IPolicyHandler {
	handle(request: Request, ability: AppAbility) {
		const index = request.params.idx;

		return ability.can(Action.Update, new User({ idx: index }));
	}
}
