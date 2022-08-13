import { Action, AppAbility } from "../../casl-ability.factory";
import { Request } from "express";
import { User } from "@entities";
import { IPolicyHandler } from "../../IPolicyHandler";

export class DeleteUserPolicyHandler implements IPolicyHandler {
	handle(_request: Request, ability: AppAbility) {
		return ability.can(Action.Read, User);
	}
}
