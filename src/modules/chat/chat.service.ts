import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, ref } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import type { User } from "@entities";
import { Conversation, Message } from "@entities";
import { BaseRepository } from "@common/database";

interface IConversation {
  users: User[]
  message: string
}

@Injectable()
export class ChatService {
  constructor(
    private readonly em: EntityManager,
        @InjectRepository(Conversation)
        private readonly conversationRepository: BaseRepository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: BaseRepository<Message>,
  ) {}

  async createConversation(conversation: IConversation) {
    const conversationNew = this.conversationRepository.create({
      chatName: conversation.users.map(user => user.username).join(", "),
      users: conversation.users,
    });

    await this.em.persistAndFlush(conversationNew);
  }

  async sendMessage(data: IConversation) {
    const [sender, receiver] = data.users;
    const conversationExists = await this.getConversation(
      sender!.id,
      receiver!.id,
    );

    const messageNew = this.messageRepository.create({
      body: data.message,
      sender: sender!,
      conversation: conversationExists,
    });

    if (conversationExists) {
      messageNew.conversation = ref(conversationExists);
      conversationExists.messages.add(messageNew);

      await Promise.allSettled([this.em.persistAndFlush(messageNew), this.em.flush()]);
    }
    else {
      const conversationNew = this.conversationRepository.create({
        chatName: data.users.map(user => user.username).join(", "),
        users: data.users,
        messages: [messageNew],
      });

      messageNew.conversation = ref(conversationNew);

      await Promise.allSettled([
        this.em.persistAndFlush(messageNew),
        this.em.persistAndFlush(conversationNew),
      ]);
    }
  }

  async getConversation(
    sender: number,
    receiver: number,
  ): Promise<Conversation> {
    return this.conversationRepository.findOneOrFail({ users: [sender, receiver] });
  }

  async getConversationForUser(user: User) {
    return await this.conversationRepository
      .qb("c")
      .select("c.*")
      .leftJoinAndSelect("c.messages", "m")
      .where("uc.user_id = ?", [user.id])
      .execute();
  }

  async markMessagesAsSeen(
    sender: number,
    receiver: number,
  ): Promise<Conversation> {
    const conversation = await this.getConversation(sender, receiver);

    await this.messageRepository.nativeUpdate(
      {
        conversation: conversation.id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return conversation;
  }
}
