import { Injectable } from "@nestjs/common";

import { CreateChatDto } from "./dto/create-chat.dto";

interface IClentIdentity {
	name: string;
	idx: string;
	clientId: string;
}

@Injectable()
export class ChatService {
	messages: any[] = [];
	clientToUser: IClentIdentity[] = [];

	identify(name: string, index: string, clientId: string) {
		const client = {
			name,
			idx: index,
			clientId,
		};

		this.clientToUser.push(client);
	}

	create(createChatDto: CreateChatDto, clientId: string) {
		const message = {
			username: this.clientToUser[clientId],
			message: createChatDto.message,
		};

		this.messages.push(message);

		return message;
	}

	getClientName(id: string) {
		return this.clientToUser[id];
	}

	findAll() {
		return this.messages;
	}
}
