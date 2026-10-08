import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { Conversation, Message } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver, ref } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

interface IConversation {
  users: User[];
  message: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: BaseRepository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: BaseRepository<Message>,
  ) {}

  async createConversation(conversation: IConversation) {
    const conversationNew = this.conversationRepository.create({
      chatName: conversation.users.map((user) => user.username).join(", "),
      users: conversation.users,
    });

    await this.em.persist(conversationNew).flush();
  }

  async sendMessage(data: IConversation) {
    const [sender, receiver] = data.users;
    // A nullable lookup: the first message between two users has to open the
    // conversation, so `getConversation` (which throws) cannot be used here.
    const conversationExists = await this.conversationRepository.findOne({
      users: [sender!.id, receiver!.id],
    });

    if (conversationExists) {
      const messageNew = this.messageRepository.create({
        body: data.message,
        sender: sender!,
        conversation: ref(conversationExists),
      });

      conversationExists.messages.add(messageNew);

      await Promise.allSettled([this.em.persist(messageNew).flush(), this.em.flush()]);
    } else {
      // `Message.conversation` is required, so the conversation has to exist
      // before the message. The owning side is enough for the ORM to fill the
      // inverse `messages` collection.
      const conversationNew = this.conversationRepository.create({
        chatName: data.users.map((user) => user.username).join(", "),
        users: data.users,
      });

      const messageNew = this.messageRepository.create({
        body: data.message,
        sender: sender!,
        conversation: ref(conversationNew),
      });

      await Promise.allSettled([
        this.em.persist(messageNew).flush(),
        this.em.persist(conversationNew).flush(),
      ]);
    }
  }

  async getConversation(sender: number, receiver: number): Promise<Conversation> {
    return this.conversationRepository.findOneOrFail({ users: [sender, receiver] });
  }

  async getConversationForUser(user: User) {
    return this.conversationRepository
      .qb("c")
      .select("c.*")
      .leftJoinAndSelect("c.messages", "m")
      .where("uc.user_id = ?", [user.id])
      .execute();
  }

  async markMessagesAsSeen(sender: number, receiver: number): Promise<Conversation> {
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
