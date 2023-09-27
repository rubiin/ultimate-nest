/* eslint-disable ts/no-unsafe-return */
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { CloudinaryService } from "nestjs-cloudinary";

import {
  mockAmqConnection,
  mockCloudinaryService,
  mockConfigService,
  mockEm,
  mockFile,
  mockUserRepo,
  mockedUser,
  queryDto,
} from "@mocks";
import { User } from "@entities";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AmqpConnection, useValue: mockAmqConnection },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: EntityManager, useValue: mockEm },
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
      expect(mockUserRepo.findOne).toBeCalledWith({
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
        }) as any,
    );

    service.create({ ...mockedUser, files: mockFile }).subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedUser });
      expect(createSpy).toBeCalledWith({ ...mockedUser });
      expect(mockEm.transactional).toBeCalled();
    });
  });

  it("should edit user", async () => {
    mockUserRepo.assign.mockImplementation((entity, dto) => Object.assign(entity, dto));

    service.update("userId", { firstName: "updated" }).subscribe((result) => {
      expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
      expect(mockUserRepo.assign).toBeCalled();
      expect(mockEm.flush).toBeCalled();
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
      expect(result).toStrictEqual({
        ...mockedUser,
        idx: "userId",
        isDeleted: true,
        deletedAt: expect.any(Date),
      });
      expect(mockUserRepo.findOne).toBeCalledWith({
        idx: "userId",
        isActive: true,
        isDeleted: false,
      });

      expect(mockUserRepo.softRemoveAndFlush).toBeCalled();
    });
  });
});
