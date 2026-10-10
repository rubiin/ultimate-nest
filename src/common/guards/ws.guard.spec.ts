import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { mockJwtService, mockUserRepo } from "@mocks";

import { WsJwtGuard } from "./ws.guard";

describe("wsJwtGuard", () => {
  const buildContext = (authorization?: string | null) =>
    createMock<ExecutionContext>({
      switchToWs: () => ({
        getClient: () => ({
          handshake: { headers: { authorization } },
        }),
      }),
    });

  let guard: WsJwtGuard;

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new WsJwtGuard(mockJwtService as unknown as JwtService, mockUserRepo);

    mockJwtService.verify.mockResolvedValue({ sub: 1, type: "access" } as never);
    mockUserRepo.findOne.mockResolvedValue(new User({ id: 1 }) as never);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow a request with a valid token and an existing user", async () => {
    await expect(guard.canActivate(buildContext("valid-token"))).resolves.toBe(true);

    expect(mockJwtService.verify).toHaveBeenCalledWith("valid-token");
    expect(mockUserRepo.findOne).toHaveBeenCalledWith({ id: 1 });
  });

  // Regression: any token signed with the secret (a refresh token, a partial 2fa token)
  // authenticated a WebSocket connection.
  it.each([["refresh"], ["2fa"], [undefined]])(
    "should reject a token typed %s without looking up the user",
    async (type) => {
      mockJwtService.verify.mockResolvedValue({ sub: 1, type } as never);

      await expect(guard.canActivate(buildContext("some-token"))).rejects.toBeInstanceOf(
        WsException,
      );
      expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    },
  );

  it("should throw when the authorization header is missing", async () => {
    await expect(guard.canActivate(buildContext(undefined))).rejects.toBeInstanceOf(WsException);
    expect(mockJwtService.verify).not.toHaveBeenCalled();
  });

  it("should throw when the authorization header is null", async () => {
    await expect(guard.canActivate(buildContext(null))).rejects.toBeInstanceOf(WsException);
    expect(mockJwtService.verify).not.toHaveBeenCalled();
  });

  it("should throw when the token does not resolve to a user", async () => {
    mockUserRepo.findOne.mockResolvedValue(null as never);

    await expect(guard.canActivate(buildContext("valid-token"))).rejects.toBeInstanceOf(
      WsException,
    );
  });

  it("should propagate a token verification failure", async () => {
    mockJwtService.verify.mockRejectedValue(new Error("invalid token") as never);

    await expect(guard.canActivate(buildContext("bad-token"))).rejects.toThrow("invalid token");
    expect(mockUserRepo.findOne).not.toHaveBeenCalled();
  });
});
