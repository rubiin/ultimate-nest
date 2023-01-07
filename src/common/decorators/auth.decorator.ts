import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { PoliciesGuard } from "@lib/casl/PoliciesGuard";
import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";

export function Auth() {
	return applyDecorators(
		UseGuards(JwtAuthGuard, PoliciesGuard),
		ApiBearerAuth(),
		ApiUnauthorizedResponse({ description: "No auth token" }),
	);
}
