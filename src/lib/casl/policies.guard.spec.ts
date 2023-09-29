import { createMock } from "@golevelup/ts-jest";
import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { PoliciesGuard } from "./policies.guard";
import { CaslAbilityFactory } from "./casl-ability.factory";

describe("policiesGuard", () => {
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
