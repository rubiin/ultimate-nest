import { CHECK_POLICIES_KEY_META, IS_PUBLIC_KEY_META } from "@common/constant";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { PolicyHandler } from "./policy.interface";

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY_META, context.getHandler());

		// if route is marked as public, allow request
		if (isPublic) {
			return true;
		}

		const policyHandlers =
			this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY_META, context.getHandler()) ||
			[];

		const request = context.switchToHttp().getRequest();

		const { user } = request;

		const ability = this.caslAbilityFactory.createForUser(user);

		return policyHandlers.every(handler =>
			this.execPolicyHandler(handler, request as Request, ability),
		);
	}

	private execPolicyHandler(handler: PolicyHandler, request: Request, ability: AppAbility) {
		if (typeof handler === "function") {
			return handler(request, ability);
		}

		return handler.handle(request, ability);
	}
}
