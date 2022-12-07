import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Namespace, Socket } from "socket.io";

@WebSocketGateway({
	namespace: "chat",
})
export class ChatGateway {
	@WebSocketServer() server: Namespace;
	constructor(private readonly chatService: ChatService) {}

	@SubscribeMessage("createChat")
	async create(@MessageBody() createChatDto: CreateChatDto) {
		const message = this.chatService.create(createChatDto);

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
		return this.chatService.typing();
	}

	@SubscribeMessage("join")
	joinRoom(@MessageBody("username") username: string, @ConnectedSocket() client: Socket) {
		return this.chatService.identify(username, client.id);
	}
}
