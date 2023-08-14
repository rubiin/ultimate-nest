import { SetMetadata } from '@nestjs/common';
import type { PolicyHandler } from './policy.interface';

import { CHECK_POLICIES_KEY_META } from '@common/constant';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY_META, handlers);
