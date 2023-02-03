import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { CaslAbilityFactory } from "./casl-ability.factory";
import { PoliciesGuard } from "./policies.guard";

describe("PoliciesGuard", () => {
	const mockReflector = createMock<Reflector>();
	const mockExecutionContext = createMock<ExecutionContext>({
		getHandler: jest.fn(),
	});
	const caslFactory = new CaslAbilityFactory();

	const policiesGuard = new PoliciesGuard(mockReflector, caslFactory);

	it("should be defined", () => {
		expect(policiesGuard).toBeDefined();
	});

	it("should return true if isPublic is true", async () => {
		mockReflector.get.mockReturnValue(true);
		const result = await policiesGuard.canActivate(mockExecutionContext);

		expect(result).toBe(true);
	});
});
