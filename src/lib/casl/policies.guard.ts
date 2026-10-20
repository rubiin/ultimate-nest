import { CHECK_POLICIES_KEY_META, IS_PUBLIC_KEY_META } from "@common/constant";
import { User } from "@entities";
import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { PolicyHandler, SubjectResolver } from "./policy.interface";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY_META, context.getHandler());

    // if route is marked as public, allow request
    if (isPublic) return true;

    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY_META, context.getHandler()) ?? [];

    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const { user } = request;

    const ability = this.caslAbilityFactory.createForUser(user as User);

    // A handler may load a row and so resolve to a promise; `.every` over a pending
    // promise is truthy and would read every denial as a pass. Await each and stop
    // at the first rejection.
    for (const handler of policyHandlers) {
      if (!(await this.execPolicyHandler(handler, request, ability))) return false;
    }

    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, request: NestifyRequest, ability: AppAbility) {
    // Loads the row a `Delete` is checked against. The filter is keyed at runtime from
    // the handler's lookup, so it is cast to the library's query shape, not to `any`.
    const resolve: SubjectResolver = (subject, value, field) =>
      this.em.findOne<object>(subject, { [field]: value } as FilterQuery<object>);

    if (typeof handler === "function") return handler(request, ability, resolve);

    return handler.handle(request, ability, resolve);
  }
}
