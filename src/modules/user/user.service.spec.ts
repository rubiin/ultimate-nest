import { Referral, User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MailerService } from "@lib/mailer/mailer.service";
import {
  mockAmqConnection,
  mockCloudinaryService,
  mockConfigService,
  mockEm,
  mockFile,
  mockMailService,
  mockReferralRepo,
  mockUserRepo,
  mockedUser,
  queryDto,
} from "@mocks";
import { ConfigService } from "@nestjs/config";
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
    mockUserRepo.qbCursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);

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
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AmqpConnection, useValue: mockAmqConnection },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: MailerService, useValue: mockMailService },
        {
          provide: EntityManager<PostgreSqlDriver>,
          useValue: mockEm as unknown as EntityManager<PostgreSqlDriver>,
        },
        // UserService reaches the EntityManager through `orm.em`.
        { provide: MikroORM, useValue: { em: mockEm } },
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

  it("should edit user", async () => {
    // `update` pipes through `uploadImage$`, which is only assigned when an image
    // is supplied, so the call has to pass one.
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
