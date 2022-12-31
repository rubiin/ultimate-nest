import { applyDecorators, Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { capitalize } from "helper-fns";

import { Auth } from "./auth.decorator";

export function GenericController(name: string, secured = true) {
	const decsToApply = [
		ApiTags(capitalize(name)),
		Controller(name),
	];

	if (secured) {
		decsToApply.push(Auth());
	}

	return applyDecorators(...decsToApply);
}
