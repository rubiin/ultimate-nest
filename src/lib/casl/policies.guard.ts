import  { User } from "@entities"
import  { CanActivate, ExecutionContext } from "@nestjs/common"
import  { Reflector } from "@nestjs/core"
import  { AppAbility, CaslAbilityFactory } from "./casl-ability.factory"
import  { PolicyHandler } from "./policy.interface"
import { CHECK_POLICIES_KEY_META, IS_PUBLIC_KEY_META } from "@common/constant"
import { Injectable } from "@nestjs/common"

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY_META, context.getHandler())

    // if route is marked as public, allow request
    if (isPublic)
      return true

    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY_META, context.getHandler()) ?? []

    const request = context.switchToHttp().getRequest<NestifyRequest>()

    const { user } = request

    const ability = this.caslAbilityFactory.createForUser(user as User)

    return policyHandlers.every(handler =>
      this.execPolicyHandler(handler, request, ability),
    )
  }

  private execPolicyHandler(handler: PolicyHandler, request: NestifyRequest, ability: AppAbility) {
    if (typeof handler === "function")
      return handler(request, ability)

    return handler.handle(request, ability)
  }
}
