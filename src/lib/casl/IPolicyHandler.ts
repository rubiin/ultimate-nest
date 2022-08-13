import { AppAbility } from "./casl-ability.factory";
import { Request } from "express";

export interface IPolicyHandler {
	handle(request: Request, ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (request: Request, ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
