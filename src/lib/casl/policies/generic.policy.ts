import { Request } from "express";
import { Action, AppAbility, Subjects } from "../casl-ability.factory";
import { IPolicyHandler } from "../IPolicyHandler";

export class GenericPolicyHandler<T extends Subjects> implements IPolicyHandler {
	constructor(private readonly type: T, private readonly action: Action = Action.Read) {}

	handle(_request: Request, ability: AppAbility) {
		return ability.can(this.action, this.type);
	}
}
