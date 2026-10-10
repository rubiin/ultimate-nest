import { OtpPurpose } from "@common/@types";
import { OtpLog, Protocol, Referral, User } from "@entities";
import { VerifyEmailMail } from "@lib/mail";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
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
  mockProtocolRepo,
  mockReferralRepo,
  mockUserRepo,
  mockedUser,
  queryDto,
  trackMockTransaction,
} from "@mocks";
import { ConfigService } from "@nestjs/config";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { Mailer } from "@nestjs/mail";
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
    mockUserRepo.cursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Referral),
          useValue: mockReferralRepo,
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

  it("should upload, persist and publish inside a REQUIRED transaction", async () => {
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
    expect(mockEm.transactional).toHaveBeenCalledWith(expect.any(Function), {
      propagation: TransactionPropagation.REQUIRED,
    });
    expect(calls).toStrictEqual([
      ["uploadFile", true],
      ["flush", true],
      ["publish", true],
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
});
