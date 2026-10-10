import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { AuthService } from "@modules/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { Namespace, Socket } from "socket.io";

import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { SocketConnectionService } from "./socket-connection.service";

describe("chatGateway", () => {
  const connectionService = createMock<SocketConnectionService>();
  const authService = createMock<AuthService>();
  const jwtService = createMock<JwtService>();
  const gateway = new ChatGateway(
    connectionService,
    createMock<ChatService>(),
    authService,
    jwtService,
  );
  gateway.server = createMock<Namespace>();

  const buildClient = () =>
    createMock<Socket>({
      disconnect: vi.fn(),
      emit: vi.fn(),
      handshake: { headers: { authorization: "some-token" } },
      id: "socket-1",
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register the connection for an access token", async () => {
    const user = new User({ firstName: "a", id: 1 });
    jwtService.verify.mockReturnValue({ sub: 1, type: "access" } as never);
    authService.findUser.mockResolvedValue(user);
    const client = buildClient();

    await gateway.handleConnection(client);

    expect(connectionService.saveConnection).toHaveBeenCalledWith({
      connectedUser: user,
      socketId: "socket-1",
    });
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  // Regression: any token signed with the secret (a refresh token, a partial 2fa token)
  // authenticated a WebSocket connection.
  it.each([["refresh"], ["2fa"], [undefined]])(
    "should disconnect a token typed %s without looking up the user",
    async (type) => {
      jwtService.verify.mockReturnValue({ sub: 1, type } as never);
      const client = buildClient();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(authService.findUser).not.toHaveBeenCalled();
      expect(connectionService.saveConnection).not.toHaveBeenCalled();
    },
  );
});
