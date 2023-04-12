import { BaseRepository } from "@common/database";
import { Conversation, Message, User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

interface IConversation {
	users: User[];
	message: string;
}

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Conversation)
		private readonly conversationRepository: BaseRepository<Conversation>,
		@InjectRepository(Message) private readonly messageRepository: BaseRepository<Message>,
	) {}

	async createConversation(conversation: IConversation) {
		const conversationNew = this.conversationRepository.create(conversation);

		await this.conversationRepository.persistAndFlush(conversationNew);
	}

	async createMessage(data: IConversation) {
		const conversationExists = await this.getConversations(data.users[0], data.users[1]);

		const messageNew = this.messageRepository.create({
			body: data.message,
		});

		if (conversationExists) {
			messageNew.conversation = conversationExists;

			await Promise.all([
				this.messageRepository.persistAndFlush(messageNew),
				this.conversationRepository.flush(),
			]);
		} else {
			const conversationNew = this.conversationRepository.create({
				users: data.users,
			});

			messageNew.conversation = conversationNew;
			await this.conversationRepository.persistAndFlush(conversationNew);
		}
	}

	async getConversations(sender: User, receiver: User) {
		return this.conversationRepository.findOne({ users: [sender, receiver] });
	}

	async getConversationById(id: number) {
		return this.conversationRepository.findOne(id);
	}
}
