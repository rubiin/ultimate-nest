import { NewsLetter, Subscriber } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import {
  mockAmqConnection,
  mockConfigService,
  mockEm,
  mockNewsLetterRepo,
  mockSubscriberRepo,
} from "@mocks";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom, of } from "rxjs";

import { NewsLetterService } from "./newsletter.service";

describe("newsLetterService", () => {
  let service: NewsLetterService;

  const subscriber = new Subscriber({ email: "someone@gmail.com", id: 1 });
  const email = "someone@gmail.com";

  beforeEach(async () => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockSubscriberRepo.getEntityManager.mockReturnValue(mockEm as never);
    mockSubscriberRepo.create.mockImplementation(((dto: object) => new Subscriber(dto)) as never);
    mockSubscriberRepo.softRemoveAndFlush.mockReturnValue(of(subscriber) as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsLetterService,
        { provide: getRepositoryToken(NewsLetter), useValue: mockNewsLetterRepo },
        { provide: getRepositoryToken(Subscriber), useValue: mockSubscriberRepo },
        { provide: AmqpConnection, useValue: mockAmqConnection },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<NewsLetterService>(NewsLetterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneSubscription", () => {
    it("should emit the subscriber when found", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);

      const result = await lastValueFrom(service.findOneSubscription(email));

      expect(result).toBe(subscriber);
      expect(mockSubscriberRepo.findOne).toHaveBeenCalledWith({ email });
    });

    it("should throw NotFoundException when the subscriber does not exist", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.findOneSubscription(email))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("subscribeNewsLetter", () => {
    // BUG (pinned, not fixed here): `subscribeNewsLetter` pipes through
    // `findOneSubscription`, which throws NotFoundException when the subscriber
    // does not exist - the exact case a new subscription hits. So a fresh email
    // always 404s, and the `entity === null` "already exists" branch below it is
    // unreachable. Behaviour is asserted as-is so a future fix is visible in the diff.
    it("should reject a brand new subscriber instead of creating one", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.subscribeNewsLetter({ email }))).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockSubscriberRepo.create).not.toHaveBeenCalled();
      expect(mockEm.persist).not.toHaveBeenCalled();
    });

    it("should create a duplicate record when the subscriber already exists", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);

      const result = await lastValueFrom(service.subscribeNewsLetter({ email }));

      expect(result).toBeInstanceOf(Subscriber);
      expect(result.email).toEqual(email);
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });

  describe("unSubscribeNewsLetter", () => {
    it("should soft remove the subscriber and emit it", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);
      mockSubscriberRepo.softRemoveAndFlush.mockReturnValue(of(subscriber) as never);

      const result = await lastValueFrom(service.unSubscribeNewsLetter({ email }));

      expect(result).toBe(subscriber);
      expect(mockSubscriberRepo.softRemoveAndFlush).toHaveBeenCalledWith(subscriber);
    });

    it("should propagate NotFoundException when the subscriber does not exist", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.unSubscribeNewsLetter({ email }))).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockSubscriberRepo.softRemoveAndFlush).not.toHaveBeenCalled();
    });
  });

  describe("sendNewsLetter", () => {
    it("should publish one message per subscriber", async () => {
      const second = new Subscriber({ email: "another@gmail.com", id: 2 });
      mockSubscriberRepo.findAll.mockReturnValue(Promise.resolve([subscriber, second]) as never);
      mockAmqConnection.publish.mockResolvedValue(undefined as never);
      mockConfigService.get.mockReturnValue("some-value" as never);

      await service.sendNewsLetter();

      expect(mockAmqConnection.publish).toHaveBeenCalledTimes(2);
      expect(mockAmqConnection.publish).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ to: subscriber.email }),
      );
      expect(mockAmqConnection.publish).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ to: second.email }),
      );
    });

    it("should not publish anything when there are no subscribers", async () => {
      mockSubscriberRepo.findAll.mockReturnValue(Promise.resolve([]) as never);

      await service.sendNewsLetter();

      expect(mockAmqConnection.publish).not.toHaveBeenCalled();
    });

    it("should not reject when a publish fails", async () => {
      mockSubscriberRepo.findAll.mockReturnValue(Promise.resolve([subscriber]) as never);
      mockAmqConnection.publish.mockRejectedValue(new Error("broker down") as never);
      mockConfigService.get.mockReturnValue("some-value" as never);

      await expect(service.sendNewsLetter()).resolves.toBeUndefined();
    });
  });
});
