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
      disconnect: vi.fn<Socket["disconnect"]>(),
      emit: vi.fn<Socket["emit"]>(),
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

  it("should disconnect when the token cannot be verified", async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error("invalid signature");
    });
    const client = buildClient();

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalled();
    expect(connectionService.deleteBySocketId).toHaveBeenCalledWith("socket-1");
  });

  it("should disconnect when the token owner no longer exists", async () => {
    jwtService.verify.mockReturnValue({ sub: 1, type: "access" } as never);
    authService.findUser.mockResolvedValue(null as never);
    const client = buildClient();

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalled();
    expect(connectionService.saveConnection).not.toHaveBeenCalled();
  });

  it("should announce the online users once connected", async () => {
    jwtService.verify.mockReturnValue({ sub: 1, type: "access" } as never);
    authService.findUser.mockResolvedValue(new User({ firstName: "a", id: 1 }));
    connectionService.getAllOnlineUSers.mockReturnValue(["a"] as never);

    await gateway.handleConnection(buildClient());

    expect(gateway.server.emit).toHaveBeenCalledWith("onlineUsers", ["a"]);
  });

  it("should log the namespace on init", () => {
    gateway.afterInit();

    expect(gateway.server.name).toBeDefined();
  });

  describe("create", () => {
    it("should persist the message and emit it to the receiver room", async () => {
      const chatService = createMock<ChatService>();
      const subject = new ChatGateway(connectionService, chatService, authService, jwtService);
      subject.server = createMock<Namespace>();

      const sender = new User({ id: 1 });
      const receiver = new User({ id: 2 });
      connectionService.findBySocketId.mockReturnValue(receiver);
      const client = createMock<Socket>({ id: "socket-1" });
      const emit = vi.fn<Socket["emit"]>();
      (client as unknown as { to: unknown }).to = vi.fn<() => unknown>(() => ({ emit }));

      const result = await subject.create(
        { message: "hi", to: "socket-2" } as never,
        client,
        sender,
      );

      expect(chatService.sendMessage).toHaveBeenCalledWith({
        message: "hi",
        users: [sender, receiver],
      });
      expect(emit).toHaveBeenCalledWith("receive", "hi");
      expect(result).toEqual({ message: "hi", to: "socket-2" });
    });
  });

  describe("markAsSeen", () => {
    it("should mark the messages between the two sockets as seen", async () => {
      const chatService = createMock<ChatService>();
      const subject = new ChatGateway(connectionService, chatService, authService, jwtService);
      subject.server = createMock<Namespace>();

      connectionService.findBySocketId.mockReturnValueOnce({ id: 1 } as never);
      connectionService.findBySocketId.mockReturnValueOnce({ id: 2 } as never);

      await subject.markAsSeen(
        { receiver: "socket-2" } as never,
        createMock<Socket>({ id: "socket-1" }),
      );

      expect(chatService.markMessagesAsSeen).toHaveBeenCalledWith(1, 2);
    });
  });
});
