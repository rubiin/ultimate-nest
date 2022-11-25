import { Request } from "express";

import { AppAbility } from "./casl-ability.factory";

export interface IPolicyHandler {
	handle(request: Request, ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (request: Request, ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
