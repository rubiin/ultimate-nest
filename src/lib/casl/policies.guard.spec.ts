import { Roles } from "@common/@types";
import { CHECK_POLICIES_KEY_META } from "@common/constant";
import { createMock } from "@golevelup/ts-vitest";
import { EntityManager } from "@mikro-orm/core";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { CaslAbilityFactory } from "./casl-ability.factory";
import { PoliciesGuard } from "./policies.guard";

describe("policiesGuard", () => {
  const mockReflector = createMock<Reflector>();
  const mockExecutionContext = createMock<ExecutionContext>({
    getHandler: vi.fn<ExecutionContext["getHandler"]>(),
  });
  const caslFactory = new CaslAbilityFactory();
  const mockEm = createMock<EntityManager>();

  const policiesGuard = new PoliciesGuard(mockReflector, caslFactory, mockEm);

  it("should be defined", () => {
    expect(policiesGuard).toBeDefined();
  });

  it("should return true if isPublic is true", async () => {
    mockReflector.get.mockReturnValue(true);
    const result = await policiesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it("should return true when there are no policy handlers", async () => {
    mockReflector.get.mockReturnValue(undefined);
    vi.mocked(mockExecutionContext.switchToHttp().getRequest).mockReturnValue({
      user: { id: "user-id", roles: [Roles.USER] },
    } as never);

    await expect(policiesGuard.canActivate(mockExecutionContext)).resolves.toBe(true);
  });

  it("should delegate to a policy handler object", async () => {
    const handle = vi.fn<() => boolean>().mockReturnValue(true);
    mockReflector.get.mockImplementation((key: unknown) =>
      key === CHECK_POLICIES_KEY_META ? [{ handle }] : undefined,
    );
    vi.mocked(mockExecutionContext.switchToHttp().getRequest).mockReturnValue({
      params: {},
      user: { id: "user-id", roles: [Roles.USER] },
    } as never);

    await expect(policiesGuard.canActivate(mockExecutionContext)).resolves.toBe(true);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("should call a bare function policy", async () => {
    const policy = vi.fn<() => boolean>().mockReturnValue(false);
    mockReflector.get.mockImplementation((key: unknown) =>
      key === CHECK_POLICIES_KEY_META ? [policy] : undefined,
    );
    vi.mocked(mockExecutionContext.switchToHttp().getRequest).mockReturnValue({
      params: {},
      user: { id: "user-id", roles: [Roles.USER] },
    } as never);

    await expect(policiesGuard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(policy).toHaveBeenCalledTimes(1);
  });

  it("should deny as soon as one policy rejects", async () => {
    const allow = vi.fn<() => boolean>().mockReturnValue(true);
    const deny = vi.fn<() => boolean>().mockReturnValue(false);
    mockReflector.get.mockImplementation((key: unknown) =>
      key === CHECK_POLICIES_KEY_META ? [allow, deny] : undefined,
    );
    vi.mocked(mockExecutionContext.switchToHttp().getRequest).mockReturnValue({
      params: {},
      user: { id: "user-id", roles: [Roles.USER] },
    } as never);

    await expect(policiesGuard.canActivate(mockExecutionContext)).resolves.toBe(false);
  });

  // A Delete handler loads its row and so resolves asynchronously. every() over a
  // pending promise is truthy, which would read that denial as a pass.
  it("should treat an async policy rejection as a denial", async () => {
    const deny = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);
    mockReflector.get.mockImplementation((key: unknown) =>
      key === CHECK_POLICIES_KEY_META ? [{ handle: deny }] : undefined,
    );
    vi.mocked(mockExecutionContext.switchToHttp().getRequest).mockReturnValue({
      params: {},
      user: { id: "user-id", roles: [Roles.USER] },
    } as never);

    await expect(policiesGuard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(deny).toHaveBeenCalledTimes(1);
  });
});
