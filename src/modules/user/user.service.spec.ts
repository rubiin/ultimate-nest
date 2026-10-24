import { OtpPurpose } from "@common/@types";
import { OtpLog, Protocol, Referral, User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { VerifyEmailMail, WelcomeMail } from "@lib/mail";
import { EntityManager, TransactionPropagation } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
  mockAmqConnection,
  mockCloudinaryService,
  mockConfigService,
  mockEm,
  mockFile,
  mockMailService,
  mockOtpLogRepo,
  mockProtocolRepo,
  mockReferralRepo,
  mockResilienceService,
  mockUserRepo,
  mockedUser,
  queryDto,
  trackMockTransaction,
} from "@mocks";
import { OtpService } from "@modules/otp";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mailer } from "@nestjs/mail";
import { ResilienceService } from "@nestjs/resilience";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { CloudinaryService } from "nestjs-cloudinary";
import { lastValueFrom, of } from "rxjs";

import { UserService } from "./user.service";

describe("userService", () => {
  let service: UserService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Shared mocks return a `{ user }` wrapper used by the auth specs; userService
    // works with the entity itself, so shape it per-suite.
    mockUserRepo.findOne.mockImplementation((async (options: { idx?: string }) =>
      Promise.resolve({ ...mockedUser, idx: options.idx })) as never);

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.transactional.mockImplementation((async (cb: (em: unknown) => Promise<void>) =>
      cb(mockEm)) as never);
    mockEm.flush.mockResolvedValue(undefined);
    mockCloudinaryService.uploadFile.mockResolvedValue({ url: "https://cdn/avatar.png" } as never);
    mockAmqConnection.publish.mockResolvedValue(undefined as never);
    mockUserRepo.getEntityManager.mockReturnValue(mockEm as never);
    // OtpService issues through the repository now, so the entity has to be a real OtpLog for
    // the `instanceof` assertions below.
    mockOtpLogRepo.create.mockImplementation(
      ((data: Partial<OtpLog>) => new OtpLog(data)) as never,
    );
    mockUserRepo.cursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        OtpService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Referral),
          useValue: mockReferralRepo,
        },
        {
          provide: getRepositoryToken(OtpLog),
          useValue: mockOtpLogRepo,
        },
        {
          provide: getRepositoryToken(Protocol),
          useValue: mockProtocolRepo,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AmqpConnection, useValue: mockAmqConnection },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: Mailer, useValue: mockMailService },
        {
          provide: EntityManager<PostgreSqlDriver>,
          useValue: mockEm as unknown as EntityManager<PostgreSqlDriver>,
        },
        { provide: ResilienceService, useValue: mockResilienceService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should findOne", async () => {
    const result = await lastValueFrom(service.findOne("userId"));

    expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
    expect(mockUserRepo.findOne).toHaveBeenCalledWith({
      idx: "userId",
    });
  });

  it("should create user", async () => {
    mockUserRepo.create.mockImplementation(((dto: Record<string, unknown>) => ({
      ...dto,
    })) as never);

    const result = await lastValueFrom(service.create({ ...mockedUser, files: mockFile } as never));

    expect(result).toMatchObject({
      ...mockedUser,
      // The service overwrites the placeholder avatar with the Cloudinary URL.
      avatar: "https://cdn/avatar.png",
    });
    expect(mockUserRepo.create).toHaveBeenCalledWith({ ...mockedUser, avatar: "" });
    expect(mockEm.transactional).toHaveBeenCalled();
  });

  it("should persist a verification OTP and email it on sign-up", async () => {
    mockUserRepo.create.mockImplementation(((dto: Record<string, unknown>) => ({
      ...dto,
    })) as never);

    await lastValueFrom(service.create({ ...mockedUser, files: mockFile } as never));

    const [persisted] = mockEm.persist.mock.calls[0] as [unknown[]];
    const otp = persisted.find((entity) => entity instanceof OtpLog) as OtpLog;

    expect(otp.otpCode).toHaveLength(6);
    expect(otp.purpose).toBe(OtpPurpose.VERIFY_EMAIL);
    expect(otp.expiresIn.getTime()).toBeGreaterThan(Date.now());
    expect(mockMailService.send).toHaveBeenCalledWith(VerifyEmailMail, {
      to: mockedUser.email,
      data: { firstName: expect.any(String), otp: otp.otpCode },
    });
  });

  it("should expire the verification OTP using the active protocol", async () => {
    mockUserRepo.create.mockImplementation(((dto: Record<string, unknown>) => ({
      ...dto,
    })) as never);
    mockProtocolRepo.findOne.mockResolvedValue({ otpExpiryInMinutes: 30 } as never);
    const before = Date.now();

    await lastValueFrom(service.create({ ...mockedUser, files: mockFile } as never));

    const [persisted] = mockEm.persist.mock.calls[0] as [unknown[]];
    const otp = persisted.find((entity) => entity instanceof OtpLog) as OtpLog;

    expect(mockProtocolRepo.findOne).toHaveBeenCalledWith({ isActive: true });
    expect(otp.expiresIn.getTime()).toBeGreaterThanOrEqual(before + 30 * 60_000);
  });

  it("should upload outside the transaction, persist inside, and publish outside", async () => {
    mockUserRepo.create.mockImplementation(((dto: Record<string, unknown>) => ({
      ...dto,
    })) as never);
    const inTransaction = trackMockTransaction();
    const calls: [string, boolean][] = [];
    mockCloudinaryService.uploadFile.mockImplementation((async () => {
      calls.push(["uploadFile", inTransaction()]);
      return { url: "https://cdn/avatar.png" };
    }) as never);
    mockEm.flush.mockImplementation((async () => {
      calls.push(["flush", inTransaction()]);
    }) as never);
    mockAmqConnection.publish.mockImplementation((async () => {
      calls.push(["publish", inTransaction()]);
    }) as never);

    await lastValueFrom(service.create({ ...mockedUser, files: mockFile } as never));

    expect(mockEm.transactional).toHaveBeenCalledTimes(1);
    expect(calls).toStrictEqual([
      ["uploadFile", false],
      ["flush", true],
      ["publish", false],
    ]);
  });

  it("should edit user", async () => {
    const result = await lastValueFrom(
      service.update("userId", { firstName: "updated" }, mockFile as never),
    );

    expect(result).toMatchObject({
      ...mockedUser,
      avatar: "https://cdn/avatar.png",
      firstName: "updated",
      idx: "userId",
    });
    expect(mockUserRepo.assign).toHaveBeenCalled();
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should edit user when no file is attached", async () => {
    const result = await lastValueFrom(service.update("userId", { firstName: "updated" }));

    expect(result).toMatchObject({
      ...mockedUser,
      firstName: "updated",
      idx: "userId",
    });
    expect(result.avatar).toBe(mockedUser.avatar);
    expect(mockCloudinaryService.uploadFile).not.toHaveBeenCalled();
    expect(mockUserRepo.assign).toHaveBeenCalled();
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should get user list", async () => {
    const result = await lastValueFrom(service.findAll(queryDto));

    expect(result.meta).toBeDefined();
    expect(result.data).toStrictEqual([]);
  });

  it("should remove user", async () => {
    const result = await lastValueFrom(service.remove("userId"));

    expect(result).toMatchObject({ ...mockedUser, idx: "userId", isDeleted: true });
    expect(mockUserRepo.findOne).toHaveBeenCalledWith({
      idx: "userId",
    });
    expect(mockUserRepo.softRemoveAndFlush).toHaveBeenCalled();
  });

  it("should 404 when the user to remove no longer exists", async () => {
    mockUserRepo.findOne.mockResolvedValue(null as never);

    await expect(lastValueFrom(service.remove("ghost"))).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should 404 for an unknown idx on findOne", async () => {
    mockUserRepo.findOne.mockResolvedValue(null as never);

    await expect(lastValueFrom(service.findOne("ghost", []))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe("sendMail", () => {
    it("should hand the welcome mail to the mailer", async () => {
      mockMailService.send.mockResolvedValue(undefined as never);

      await lastValueFrom(
        service.sendMail({ data: { email: "a@example.com" }, to: "a@example.com" }),
      );

      expect(mockMailService.send).toHaveBeenCalledWith(WelcomeMail, {
        data: { email: "a@example.com" },
        to: "a@example.com",
      });
    });
  });

  describe("referUser", () => {
    it("should reject a mobile number that is already registered", async () => {
      mockUserRepo.count.mockResolvedValue(1 as never);

      await expect(
        lastValueFrom(service.referUser({ mobileNumber: "9800000000" } as never, mockedUser)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockReferralRepo.create).not.toHaveBeenCalled();
    });

    it("should create the referral for a fresh mobile number", async () => {
      mockUserRepo.count.mockResolvedValue(0 as never);
      mockReferralRepo.create.mockImplementation(((data: object) => ({ ...data })) as never);

      const referral = await lastValueFrom(
        service.referUser({ mobileNumber: "9800000000" } as never, mockedUser),
      );

      expect(mockUserRepo.count).toHaveBeenCalledWith({
        isActive: true,
        mobileNumber: "9800000000",
      });
      expect(referral).toMatchObject({ mobileNumber: "9800000000" });
    });
  });

  describe("generateUsername", () => {
    it("should use the slug as-is when it is free", async () => {
      mockUserRepo.count.mockResolvedValue(0 as never);

      const username = await lastValueFrom(service.generateUsername("Ada Lovelace"));

      expect(username).toMatch(/^ada-lovelace-[a-z0-9]{6}$/);
    });

    it("should suffix the slug with the collision count", async () => {
      mockUserRepo.count.mockResolvedValue(3 as never);

      const username = await lastValueFrom(service.generateUsername("Ada Lovelace"));

      expect(username).toMatch(/^ada-lovelace-[a-z0-9]{6}3$/);
      expect(mockUserRepo.count).toHaveBeenCalledWith({
        username: { $like: `${username.replace(/3$/, "")}%` },
      });
    });
  });
});
