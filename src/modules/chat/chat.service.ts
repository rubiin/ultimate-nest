import { Injectable } from "@nestjs/common";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatService {
	messages: any = [{ message: "hello", username: "rubiin" }];
	clientToUser = {};

	identify(name: string, clientId: string) {
		this.clientToUser[clientId] = name;
		return Object.values(this.clientToUser);
	}

	create(createChatDto: CreateChatDto) {
		const message = { ...createChatDto };
		this.messages.push(createChatDto);
		return message;
	}

	getClientName(id: string) {
		return this.clientToUser[id];
	}

	findAll() {
		return this.messages;
	}

	typing() {}

	joinRoom() {}
}
