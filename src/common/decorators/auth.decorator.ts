import type { CanActivate, Type } from "@nestjs/common";
import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { API_UNAUTHORISED_RESPONSE } from "@common/constant";
import { JwtAuthGuard } from "@common/guards";
import { PoliciesGuard } from "@lib/casl/policies.guard";

interface AuthGuard {
  guards?: Type<CanActivate>[]
  unauthorizedResponse?: string
}

/**
 * It's a decorator that uses the JwtAuthGuard and PoliciesGuard guards, and returns an unauthorized
 * response if the user is not authenticated
 * @returns A function that returns a function
 */

export function Auth(options_?: AuthGuard) {
  const options = {
    guards: [JwtAuthGuard, PoliciesGuard],
    unauthorizedResponse: API_UNAUTHORISED_RESPONSE,
    ...options_,
  } satisfies AuthGuard;

  return applyDecorators(
    UseGuards(...options.guards),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: options.unauthorizedResponse }),
  );
}
