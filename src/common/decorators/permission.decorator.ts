import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Actions, UseAbility } from "nest-casl";

export function Permissions(
	action: Actions = Actions.read,
	subject: any = "all",
	subjectHook?: any,
) {
	return applyDecorators(
		UseAbility(action, subject, subjectHook),
		ApiBearerAuth(),
		ApiUnauthorizedResponse({ description: "No auth token" }),
	);
}
