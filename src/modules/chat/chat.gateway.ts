import { WsJwtGuard } from "@common/guards";
import { AuthService } from "@modules/auth/auth.service";
import { Logger, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@UseGuards(WsJwtGuard)
@WebSocketGateway({
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
	@WebSocketServer() server: Namespace;
	private readonly logger = new Logger(ChatGateway.name);

	constructor(
		private readonly chatService: ChatService,
		private readonly authService: AuthService,
		private readonly jwtService: JwtService,
	) {}

	async handleConnection(client: Socket) {
		const payload = await this.jwtService.verify(client.handshake.headers.authorization);
		const user = await this.authService.findUser(payload.sub);

		if (user) {
			this.chatService.identify(`${user.firstName} ${user.lastName}`, user.idx, client.id);
		}
		this.logger.debug(`🔗 Client connected: ${user.firstName} `);
	}
	afterInit() {
		this.logger.debug(`💬 Websocket Gateway initialized ${this.server.name} `);
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

	@SubscribeMessage("findAllChat")
	findAll() {
		return this.chatService.findAll();
	}

	@SubscribeMessage("typing")
	typing(@MessageBody("isTyping") isTyping: boolean, @ConnectedSocket() client: Socket) {
		const name = this.chatService.getClientName(client.id);

		client.broadcast.emit("typing", { name, isTyping });
	}
}
