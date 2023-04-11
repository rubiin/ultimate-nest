import { WsJwtGuard } from "@common/guards";
import { AuthService } from "@modules/auth/auth.service";
import { Logger, OnModuleDestroy, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

import { CreateChatDto } from "./dto/create-chat.dto";
import { SocketConnectionService } from "./socket-connection.service";

@UseGuards(WsJwtGuard)
@WebSocketGateway({
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit,OnGatewayDisconnect, OnModuleDestroy {
	@WebSocketServer() server: Namespace;
	private readonly logger = new Logger(ChatGateway.name);

	constructor(
		private readonly connectionService: SocketConnectionService,
		private readonly authService: AuthService,
		private readonly jwtService: JwtService,
	) {}


	async handleConnection(client: Socket) {
		// validate user, disconnect if unidentified
		try {
			const payload = await this.jwtService.verify(client.handshake.headers.authorization);
			const user = await this.authService.findUser(payload.sub);

			if (!user) {
				return this.handleDisconnect(client);
			}

			// save the connection of user to db

			const savedConnection = await this.connectionService.saveConnection({
				connectedUser: user,
				socketId: client.id,
			});

			this.logger.debug(`🔗 Client connected: ${user.firstName} `);
			
return this.server.to(client.id).emit("welcome", savedConnection);
		} catch {
			return this.handleDisconnect(client);
		}
	}

	afterInit() {
		this.logger.debug(`💬 Websocket Gateway initialized ${this.server.name} `);
	}

	async handleDisconnect(client: Socket) {
		// remove the connection from our db
		await this.connectionService.deleteBySocketId(client.id);
		this.disconnect(client);
	}

	private disconnect(socket: Socket) {
		socket.emit("Error", new UnauthorizedException());
		socket.disconnect();
	}

	@SubscribeMessage("chat")
	async create(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() _client: Socket) {
		// TODO: check why this is not working
		if (createChatDto.to) {
			this.server.to(createChatDto.to).emit("receive", createChatDto.message);
		} else {
			this.server.emit("receive", createChatDto.message);
		}

		return createChatDto;
	}

	async onModuleDestroy() {
		// delete all connection when app is stopped
		return this.connectionService.deleteAllConnection();
	}
}
