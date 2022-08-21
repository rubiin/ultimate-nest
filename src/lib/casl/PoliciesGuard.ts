import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { PolicyHandler } from "./IPolicyHandler";
import { CHECK_POLICIES_KEY } from "./policies.decorator";

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(private reflector: Reflector, private caslAbilityFactory: CaslAbilityFactory) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const policyHandlers =
			this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

		const request = context.switchToHttp().getRequest() as Request;

		const { user } = context.switchToHttp().getRequest();

		const ability = this.caslAbilityFactory.createForUser(user);

		return policyHandlers.every(handler => this.execPolicyHandler(handler, request, ability));
	}

	private execPolicyHandler(handler: PolicyHandler, request: Request, ability: AppAbility) {
		if (typeof handler === "function") {
			return handler(request, ability);
		}

		return handler.handle(request, ability);
	}
}
