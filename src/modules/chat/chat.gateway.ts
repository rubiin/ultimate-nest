import { Logger, UnauthorizedException, UseGuards, UsePipes } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

import { AuthService } from "@modules/auth/auth.service";
import { User } from "@entities";
import { WsValidationPipe } from "@common/pipes/ws-validation.pipe";
import { WsJwtGuard } from "@common/guards";
import { LoggedInUser } from "@common/decorators";
import type { JwtPayload } from "@common/@types";
import { ChatService } from "./chat.service";
import { CreateChatDto, MessageSeenDto } from "./dto";
import { SocketConnectionService } from "./socket-connection.service";

@UseGuards(WsJwtGuard)
@UsePipes(WsValidationPipe)
@WebSocketGateway({
  namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server!: Namespace;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly connectionService: SocketConnectionService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // validate user, disconnect if unidentified
    try {
      const payload: JwtPayload = await this.jwtService.verify(client.handshake.headers.authorization!);
      const user = await this.authService.findUser(payload.sub);

      if (!user)
        return this.handleDisconnect(client);

      // save the connection of user to our connection's map

      this.connectionService.saveConnection({
        connectedUser: user,
        socketId: client.id,
      });

      this.logger.log(`🔗 Client connected: ${user.firstName}`);

      return this.server.emit("onlineUsers", this.connectionService.getAllOnlineUSers());
    }
    catch {
      return this.handleDisconnect(client);
    }
  }

  afterInit() {
    this.logger.log(`💬 Websocket Gateway initialized ${this.server.name} `);
  }

  handleDisconnect(client: Socket) {
    // remove the connection from our connection's map
    this.connectionService.deleteBySocketId(client.id);
    this.disconnect(client);
  }

  @SubscribeMessage("send")
  async create(
        @MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() _client: Socket, @LoggedInUser() user: User) {
    // send message to the receiver default room
    const receiver = this.connectionService.findBySocketId(createChatDto.to);

    await this.chatService.sendMessage({
      message: createChatDto.message,
      users: [user, receiver],
    });
    _client.to(createChatDto.to).emit("receive", createChatDto.message);

    return createChatDto;
  }

  @SubscribeMessage("markAsSeen")
  async markAsSeen(
        @MessageBody() markAsSeenDto: MessageSeenDto, @ConnectedSocket() client: Socket) {
    // mark the message as seen
    const sender = this.connectionService.findBySocketId(client.id);
    const receiver = this.connectionService.findBySocketId(markAsSeenDto.receiver);

    await this.chatService.markMessagesAsSeen(sender.id, receiver.id);
  }

  private disconnect(socket: Socket) {
    socket.emit("Error", new UnauthorizedException());
    socket.disconnect();
  }
}
