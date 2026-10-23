import { RoutingKey } from "@common/@types";
import { NewsLetter, Subscriber } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import {
  mockAmqConnection,
  mockConfigService,
  mockEm,
  mockJwtService,
  mockMikroORM,
  mockNewsLetterRepo,
  mockPolicy,
  mockResilienceService,
  mockSubscriberRepo,
} from "@mocks";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CircuitOpenError, ResilienceService } from "@nestjs/resilience";
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
        { provide: MikroORM, useValue: mockMikroORM },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ResilienceService, useValue: mockResilienceService },
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
    it("should create the subscriber when the email is new", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(null as never);

      const result = await lastValueFrom(service.subscribeNewsLetter({ email }));

      expect(result).toBeInstanceOf(Subscriber);
      expect(result.email).toEqual(email);
      expect(mockSubscriberRepo.findOne).toHaveBeenCalledWith({ email });
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("should reject with BadRequest when the email is already subscribed", async () => {
      mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);

      await expect(lastValueFrom(service.subscribeNewsLetter({ email }))).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockSubscriberRepo.create).not.toHaveBeenCalled();
      expect(mockEm.persist).not.toHaveBeenCalled();
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
    const newsLetter = new NewsLetter({ idx: "news-1", name: "October", content: "Hi" });
    const second = new Subscriber({ email: "another@gmail.com", id: 2, idx: "sub-2" });

    beforeEach(() => {
      subscriber.idx = "sub-1";
      newsLetter.sentAt = undefined;
      mockNewsLetterRepo.getEntityManager.mockReturnValue(mockEm as never);
      mockNewsLetterRepo.find.mockResolvedValue([newsLetter] as never);
      mockSubscriberRepo.find.mockResolvedValue([subscriber, second] as never);
      mockAmqConnection.publish.mockResolvedValue(undefined as never);
      mockConfigService.get.mockReturnValue("some-value" as never);
    });

    it("should publish one id-only message per subscriber and stamp the newsletter", async () => {
      await service.sendNewsLetter();

      expect(mockNewsLetterRepo.find).toHaveBeenCalledWith({ sentAt: null });
      expect(mockAmqConnection.publish).toHaveBeenCalledTimes(2);
      expect(mockAmqConnection.publish).toHaveBeenCalledWith(
        expect.any(String),
        RoutingKey.SEND_NEWSLETTER,
        { newsLetterIdx: "news-1", subscriberIdx: "sub-1" },
      );
      expect(mockAmqConnection.publish).toHaveBeenCalledWith(
        expect.any(String),
        RoutingKey.SEND_NEWSLETTER,
        { newsLetterIdx: "news-1", subscriberIdx: "sub-2" },
      );
      expect(newsLetter.sentAt).toBeInstanceOf(Date);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("should not publish anything when every newsletter was already sent", async () => {
      mockNewsLetterRepo.find.mockResolvedValue([] as never);

      await service.sendNewsLetter();

      expect(mockAmqConnection.publish).not.toHaveBeenCalled();
    });

    it("should leave the newsletter unsent when there are no subscribers", async () => {
      mockSubscriberRepo.find.mockResolvedValue([] as never);

      await service.sendNewsLetter();

      expect(mockAmqConnection.publish).not.toHaveBeenCalled();
      expect(newsLetter.sentAt).toBeUndefined();
    });

    it("should not stamp the newsletter when a publish fails, so the next run retries", async () => {
      mockAmqConnection.publish.mockRejectedValue(new Error("broker down") as never);

      await expect(service.sendNewsLetter()).resolves.toBeUndefined();

      expect(newsLetter.sentAt).toBeUndefined();
    });

    // Without this the cron walks every remaining newsletter against a breaker
    // that is already open, rejecting one message per subscriber for nothing.
    it("should stop after the first open breaker instead of shedding every publish", async () => {
      const following = new NewsLetter({ idx: "news-2", name: "November", content: "Hi" });
      mockNewsLetterRepo.find.mockResolvedValue([newsLetter, following] as never);
      // Once only, so the second subscriber of the first round still goes
      // through and the assertion below is about the loop, not the mock.
      mockPolicy.execute.mockImplementationOnce(() =>
        Promise.reject(new CircuitOpenError("rabbitmq", 30000)),
      );

      await expect(service.sendNewsLetter()).resolves.toBeUndefined();

      // Two subscribers, one round: without the break this would be four.
      expect(mockPolicy.execute).toHaveBeenCalledTimes(2);
      expect(following.sentAt).toBeUndefined();
    });

    it("should run the queries inside a request context", async () => {
      let hadContext = false;
      mockNewsLetterRepo.find.mockImplementation((async () => {
        hadContext = RequestContext.currentRequestContext() !== undefined;

        return Promise.resolve([]);
      }) as never);

      await service.sendNewsLetter();

      expect(mockEm.fork).toHaveBeenCalled();
      expect(hadContext).toBe(true);
    });
  });

  describe("unsubscribe links", () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation(((key: string) =>
        key === "app.url" ? "https://api.example.com" : "v1") as never);
    });

    it("should sign a year-long unsubscribe token for the subscriber", async () => {
      mockJwtService.signAsync.mockResolvedValue("signed" as never);
      subscriber.idx = "sub-1";

      const url = await service.unsubscribeUrl(subscriber);

      expect(url).toBe("https://api.example.com/v1/newsletter/unsubscribe/signed");
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { type: "unsubscribe" },
        { expiresIn: "365d", subject: "sub-1" },
      );
    });

    it("should unsubscribe the subscriber named by a valid token", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "sub-1", type: "unsubscribe" } as never);
      mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);
      mockSubscriberRepo.softRemoveAndFlush.mockReturnValue(of(subscriber) as never);

      await lastValueFrom(service.unSubscribeWithToken("token"));

      expect(mockSubscriberRepo.findOne).toHaveBeenCalledWith({ idx: "sub-1" });
      expect(mockSubscriberRepo.softRemoveAndFlush).toHaveBeenCalledWith(subscriber);
    });

    it("should treat an already unsubscribed link as success", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "sub-1", type: "unsubscribe" } as never);
      mockSubscriberRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.unSubscribeWithToken("token"))).resolves.toStrictEqual({
        message: "You have been unsubscribed",
      });
      expect(mockSubscriberRepo.softRemoveAndFlush).not.toHaveBeenCalled();
    });

    // Every token type shares the secret, so an access or refresh token must not unsubscribe.
    it("should reject a token that is not an unsubscribe token", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "sub-1", type: "access" } as never);

      await expect(lastValueFrom(service.unSubscribeWithToken("token"))).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockSubscriberRepo.findOne).not.toHaveBeenCalled();
    });

    it("should reject an invalid or expired token", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("jwt expired") as never);

      await expect(lastValueFrom(service.unSubscribeWithToken("token"))).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
