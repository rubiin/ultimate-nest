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

import { UserService } from "./user.service";

describe("userService", () => {
  let service: UserService;

  beforeEach(async () => {
    vi.clearAllMocks();
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
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },
        // UserService reaches the EntityManager through `orm.em`.
        { provide: MikroORM, useValue: { em: mockEm } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should findOne", () => {
    service.findOne("userId").subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        idx: "userId",
        isActive: true,
        isDeleted: false,
      });
    });
  });

  it("should create user", async () => {
    const createSpy = mockUserRepo.create.mockImplementation(
      () =>
        ({
          ...mockedUser,
        }) as User,
    );

    service.create({ ...mockedUser, files: mockFile }).subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedUser });
      expect(createSpy).toHaveBeenCalledWith({ ...mockedUser });
      expect(mockEm.transactional).toHaveBeenCalled();
    });
  });

  it("should edit user", async () => {
    mockUserRepo.assign.mockImplementation((entity, dto) => Object.assign(entity, dto));

    service.update("userId", { firstName: "updated" }).subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
      expect(mockUserRepo.assign).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });
  it("should get user list", () => {
    service.findAll(queryDto).subscribe((result) => {
      expect(result.meta).toBeDefined();
      expect(result.data).toStrictEqual([]);
    });
  });

  it("should remove user", () => {
    service.remove("userId").subscribe((result) => {
      expect(result).toEqual({
        ...mockedUser,
        idx: "userId",
        isDeleted: true,
      });
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        idx: "userId",
        isActive: true,
        isDeleted: false,
      });

      expect(mockUserRepo.softRemoveAndFlush).toHaveBeenCalled();
    });
  });
});
