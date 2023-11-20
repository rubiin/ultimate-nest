import type { AppAbility } from "./casl-ability.factory";

export interface PoliciesHandler {
  handle(request: NestifyRequest, ability: AppAbility): boolean
}

type PolicyHandlerCallback = (request: NestifyRequest, ability: AppAbility) => boolean;

export type PolicyHandler = PoliciesHandler | PolicyHandlerCallback;
