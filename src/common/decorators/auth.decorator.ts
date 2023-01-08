import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { PoliciesGuard } from "@lib/casl/PoliciesGuard";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";

/**
 * It's a decorator that uses the JwtAuthGuard and PoliciesGuard guards, and returns an unauthorized
 * response if the user is not authenticated
 * @returns A function that returns a function
 *
 */
export const Auth = () => {
	return applyDecorators(
		UseGuards(JwtAuthGuard, PoliciesGuard),
		ApiBearerAuth(),
		ApiUnauthorizedResponse({ description: "No auth token" }),
	);
};
