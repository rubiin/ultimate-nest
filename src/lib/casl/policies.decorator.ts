import type { PolicyHandler } from "./policy.interface"
import { CHECK_POLICIES_KEY_META } from "@common/constant"
import { SetMetadata } from "@nestjs/common"

export function CheckPolicies(...handlers: PolicyHandler[]) {
  return SetMetadata(CHECK_POLICIES_KEY_META, handlers)
}
