import { Logger } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";

@WebSocketGateway({
	namespace: "chat",
})
export class ChatGateway {
	@WebSocketServer() server: Namespace;
	private readonly logger = new Logger(ChatGateway.name);

	constructor(private readonly chatService: ChatService) {}

	afterInit(): void {
		this.logger.log(`💬 Websocket Gateway initialized.`);
	}

	@SubscribeMessage("createChat")
	async create(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() client: Socket) {
		const message = this.chatService.create(createChatDto, client.id);

		this.server.emit("message", message);

		return message;
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

	@SubscribeMessage("join")
	joinRoom(@MessageBody("username") username: string, @ConnectedSocket() client: Socket) {
		return this.chatService.identify(username, client.id);
	}
}
