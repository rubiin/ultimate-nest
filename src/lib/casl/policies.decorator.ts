import { CHECK_POLICIES_KEY_META } from "@common/constant/index.js";
import { SetMetadata } from "@nestjs/common";

import { PolicyHandler } from "./policy.interface.js";

export function CheckPolicies(...handlers: PolicyHandler[]) {
  return SetMetadata(CHECK_POLICIES_KEY_META, handlers);
}
