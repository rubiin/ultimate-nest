import { Request } from "express";

import { AppAbility } from "./casl-ability.factory";

export interface PoliciesHandler {
	handle(request: Request, ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (request: Request, ability: AppAbility) => boolean;

export type PolicyHandler = PoliciesHandler | PolicyHandlerCallback;
