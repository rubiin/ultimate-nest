import { NewsLetterLogStatus } from "@common/@types";
import { NewsLetter, NewsLetterLog, Subscriber } from "@entities";
import { MikroORM } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { createMock } from "@golevelup/ts-vitest";
import { BaseRepository } from "@common/database";
import { NewsletterMail } from "@lib/mail";
import {
  mockEm,
  mockMailService,
  mockMikroORM,
  mockResilienceService,
  mockNewsLetterRepo,
  mockSubscriberRepo,
} from "@mocks";
import { Mailer } from "@nestjs/mail";
import { ResilienceService } from "@nestjs/resilience";
import { Test } from "@nestjs/testing";

import { NewsLetterConsumer } from "./newsletter.consumer";
import { NewsLetterService } from "./newsletter.service";

describe("newsLetterConsumer", () => {
  const mockLogRepo = createMock<BaseRepository<NewsLetterLog>>();
  const mockService = createMock<NewsLetterService>();
  const message = { newsLetterIdx: "news-1", subscriberIdx: "sub-1" };
  const newsLetter = new NewsLetter({ content: "Hello", idx: "news-1", name: "October" });
  const subscriber = new Subscriber({ email: "ada@example.com", idx: "sub-1" });
  let consumer: NewsLetterConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockLogRepo.getEntityManager.mockReturnValue(mockEm as never);
    mockLogRepo.findOne.mockResolvedValue(null as never);
    mockNewsLetterRepo.findOne.mockResolvedValue(newsLetter as never);
    mockSubscriberRepo.findOne.mockResolvedValue(subscriber as never);
    mockService.unsubscribeUrl.mockResolvedValue("https://api/unsub" as never);
    mockMailService.send.mockResolvedValue(undefined as never);

    const module = await Test.createTestingModule({
      providers: [
        NewsLetterConsumer,
        { provide: getRepositoryToken(NewsLetter), useValue: mockNewsLetterRepo },
        { provide: getRepositoryToken(Subscriber), useValue: mockSubscriberRepo },
        { provide: getRepositoryToken(NewsLetterLog), useValue: mockLogRepo },
        { provide: NewsLetterService, useValue: mockService },
        { provide: Mailer, useValue: mockMailService },
        { provide: MikroORM, useValue: mockMikroORM },
        { provide: ResilienceService, useValue: mockResilienceService },
      ],
    }).compile();

    consumer = module.get(NewsLetterConsumer);
  });

  const persistedLog = () => mockEm.persist.mock.calls[0]![0] as NewsLetterLog;

  it("should mail the subscriber with an unsubscribe link and log SENT", async () => {
    await consumer.handle(message);

    expect(mockMailService.send).toHaveBeenCalledWith(NewsletterMail, {
      data: { content: "Hello", subject: "October", unsubscribeUrl: "https://api/unsub" },
      to: "ada@example.com",
    });
    expect(persistedLog().status).toBe(NewsLetterLogStatus.SENT);
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should log FAILED with the reason instead of throwing when the send fails", async () => {
    mockMailService.send.mockRejectedValue(new Error("smtp down") as never);

    await expect(consumer.handle(message)).resolves.toBeUndefined();

    expect(persistedLog().status).toBe(NewsLetterLogStatus.FAILED);
    expect(persistedLog().error).toBe("smtp down");
  });

  it("should not mail a subscriber twice when the message is redelivered", async () => {
    mockLogRepo.findOne.mockResolvedValue({ status: NewsLetterLogStatus.SENT } as never);

    await consumer.handle(message);

    expect(mockMailService.send).not.toHaveBeenCalled();
    expect(mockEm.persist).not.toHaveBeenCalled();
  });

  it("should retry a previously failed delivery and update its log", async () => {
    const failed = new NewsLetterLog({ error: "old", status: NewsLetterLogStatus.FAILED });
    mockLogRepo.findOne.mockResolvedValue(failed as never);

    await consumer.handle(message);

    expect(failed.status).toBe(NewsLetterLogStatus.SENT);
    expect(failed.error).toBeUndefined();
  });

  it("should skip a subscriber who unsubscribed after the message was queued", async () => {
    mockSubscriberRepo.findOne.mockResolvedValue(null as never);

    await consumer.handle(message);

    expect(mockMailService.send).not.toHaveBeenCalled();
    expect(mockEm.persist).not.toHaveBeenCalled();
  });
});
