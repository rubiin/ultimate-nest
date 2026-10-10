import { Conversation, Message, User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver, ref } from "@mikro-orm/postgresql";
import { mockConversationRepo, mockEm, mockMessageRepo } from "@mocks";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { ChatService } from "./chat.service";

describe("chatService", () => {
  let service: ChatService;

  const alice = new User({ id: 1, username: "alice" });
  const bob = new User({ id: 2, username: "bob" });

  // A stub rather than a real entity: `messages` is a MikroORM `Collection`, and
  // touching it outside an initialised ORM throws a MetadataError.
  const existingConversation = {
    chatName: "alice, bob",
    id: 10,
    messages: { add: vi.fn<() => void>() },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockConversationRepo.create.mockImplementation(
      ((data: object) => new Conversation(data)) as never,
    );
    // A brand new conversation seeds no messages: the ORM fills the inverse
    // collection from `Message.conversation` when it persists.
    mockMessageRepo.create.mockImplementation(((data: object) => new Message(data)) as never);
    mockConversationRepo.findOneOrFail.mockResolvedValue(existingConversation as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },
        { provide: getRepositoryToken(Conversation), useValue: mockConversationRepo },
        { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createConversation", () => {
    it("should join the usernames into the chat name and persist", async () => {
      await service.createConversation({ message: "hi", users: [alice, bob] });

      expect(mockConversationRepo.create).toHaveBeenCalledWith({
        chatName: "alice, bob",
        users: [alice, bob],
      });
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });

  describe("sendMessage", () => {
    it("should attach the message to the existing conversation", async () => {
      mockConversationRepo.findOne.mockResolvedValue(existingConversation as never);

      await service.sendMessage({ message: "hello", users: [alice, bob] });

      expect(mockConversationRepo.findOne).toHaveBeenCalledWith({ users: [1, 2] });
      expect(mockMessageRepo.create).toHaveBeenCalledWith({
        body: "hello",
        conversation: ref(existingConversation),
        sender: alice,
      });
      expect(existingConversation.messages.add).toHaveBeenCalledWith(
        expect.objectContaining({ body: "hello" }),
      );
      expect(mockConversationRepo.create).not.toHaveBeenCalled();
    });

    // Regression: two concurrent flushes raced on one EntityManager and allSettled
    // swallowed the rejection, so a failure still returned 200.
    it("should surface a flush failure instead of swallowing it", async () => {
      mockConversationRepo.findOne.mockResolvedValue(null as never);
      mockEm.flush.mockRejectedValueOnce(new Error("deadlock"));

      await expect(service.sendMessage({ message: "first", users: [alice, bob] })).rejects.toThrow(
        "deadlock",
      );
    });

    it("should flush once for the new-conversation path", async () => {
      mockConversationRepo.findOne.mockResolvedValue(null as never);
      mockEm.flush.mockClear();

      await service.sendMessage({ message: "first", users: [alice, bob] });

      expect(mockEm.flush).toHaveBeenCalledTimes(1);
    });

    it("should create a conversation when none exists", async () => {
      mockConversationRepo.findOne.mockResolvedValue(null as never);

      await service.sendMessage({ message: "first", users: [alice, bob] });

      expect(mockConversationRepo.create).toHaveBeenCalledWith({
        chatName: "alice, bob",
        users: [alice, bob],
      });
      // Both the message and its new conversation are persisted together.
      expect(mockEm.persist).toHaveBeenCalledWith([
        expect.objectContaining({ body: "first" }),
        expect.anything(),
      ]);
      expect(mockMessageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ body: "first", sender: alice }),
      );
    });
  });

  describe("getConversation", () => {
    it("should return the conversation for the two users", async () => {
      const result = await service.getConversation(1, 2);

      expect(result).toBe(existingConversation);
      expect(mockConversationRepo.findOneOrFail).toHaveBeenCalledWith({ users: [1, 2] });
    });
  });

  describe("getConversationForUser", () => {
    it("should execute the conversation query for the user", async () => {
      const execute = vi.fn<() => Promise<unknown[]>>().mockResolvedValue([existingConversation]);
      const where = vi.fn<() => { execute: typeof execute }>().mockReturnValue({ execute });
      const leftJoinAndSelect = vi.fn<() => { where: typeof where }>().mockReturnValue({ where });
      const select = vi
        .fn<() => { leftJoinAndSelect: typeof leftJoinAndSelect }>()
        .mockReturnValue({ leftJoinAndSelect });
      mockConversationRepo.qb.mockReturnValue({ select } as never);

      const result = await service.getConversationForUser(alice);

      expect(mockConversationRepo.qb).toHaveBeenCalledWith("c");
      expect(select).toHaveBeenCalledWith("c.*");
      expect(leftJoinAndSelect).toHaveBeenCalledWith("c.messages", "m");
      expect(where).toHaveBeenCalledWith("uc.user_id = ?", [alice.id]);
      expect(result).toEqual([existingConversation]);
    });
  });

  describe("markMessagesAsSeen", () => {
    it("should flag the conversation messages as read and return the conversation", async () => {
      mockMessageRepo.nativeUpdate.mockResolvedValue(1 as never);

      const result = await service.markMessagesAsSeen(1, 2);

      expect(result).toBe(existingConversation);
      expect(mockMessageRepo.nativeUpdate).toHaveBeenCalledWith(
        { conversation: existingConversation.id },
        expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
      );
    });
  });
});
