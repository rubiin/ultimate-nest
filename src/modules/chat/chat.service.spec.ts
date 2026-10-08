import { Conversation, Message, User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
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
    messages: { add: vi.fn() },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockConversationRepo.create.mockImplementation(((data: object) => ({ ...data })) as never);
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
      await service.sendMessage({ message: "hello", users: [alice, bob] });

      expect(mockConversationRepo.findOneOrFail).toHaveBeenCalledWith({ users: [1, 2] });
      expect(mockMessageRepo.create).toHaveBeenCalledWith({
        body: "hello",
        conversation: existingConversation,
        sender: alice,
      });
      expect(existingConversation.messages.add).toHaveBeenCalledWith(
        expect.objectContaining({ body: "hello" }),
      );
      expect(mockConversationRepo.create).not.toHaveBeenCalled();
    });

    it("should propagate the error when no conversation exists", async () => {
      // `getConversation` uses `findOneOrFail`, which throws rather than
      // returning null, so the "create a conversation" branch below it in
      // `sendMessage` is unreachable. Pinned here so the change is deliberate.
      mockConversationRepo.findOneOrFail.mockRejectedValue(new Error("not found") as never);

      await expect(service.sendMessage({ message: "first", users: [alice, bob] })).rejects.toThrow(
        "not found",
      );

      expect(mockConversationRepo.create).not.toHaveBeenCalled();
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
      const execute = vi.fn().mockResolvedValue([existingConversation]);
      const where = vi.fn().mockReturnValue({ execute });
      const leftJoinAndSelect = vi.fn().mockReturnValue({ where });
      const select = vi.fn().mockReturnValue({ leftJoinAndSelect });
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
