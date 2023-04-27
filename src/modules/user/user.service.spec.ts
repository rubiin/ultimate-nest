import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { createMock } from "@golevelup/ts-jest";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedUser, mockFile, queryDto } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CloudinaryService } from "nestjs-cloudinary";

import { UserService } from "./user.service";

describe("UserService", () => {
	let service: UserService;
	const mockAmqConnection = createMock<AmqpConnection>();
	const mockCloudinaryService = createMock<CloudinaryService>();
	const mockConfigService = createMock<ConfigService>();
	const mockEm = createMock<EntityManager>();
	const mockUserRepo = createMock<BaseRepository<User>>();

	// default mocks

	mockUserRepo.findOne.mockImplementation((options: any) =>
		Promise.resolve({
			...mockedUser,
			idx: options.idx,
		} as any),
	);

	mockUserRepo.softRemoveAndFlush.mockImplementation(entity => {
		Object.assign(entity, { deletedAt: new Date(), isObsolete: true });

		return Promise.resolve(entity);
	});

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
		const findOneSpy = mockUserRepo.findOne;

		service.findOne("userId").subscribe(result => {
			expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
			expect(findOneSpy).toBeCalledWith({ idx: "userId", isActive: true, isObsolete: false });
		});
	});

	it("should create user", async () => {
		const createSpy = mockUserRepo.create.mockImplementation(
			() =>
				({
					...mockedUser,
				} as any),
		);

		const result = await service.create({ ...mockedUser, files: mockFile });

		expect(result).toStrictEqual({ ...mockedUser });
		expect(createSpy).toBeCalledWith({ ...mockedUser });
		expect(mockEm.transactional).toBeCalled();
	});

	it("should edit user", async () => {
		mockUserRepo.assign.mockImplementation((entity, dto) => Object.assign(entity, dto));

		service.update("userId", { firstName: "updated" }).subscribe(result => {
			expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
			expect(mockUserRepo.assign).toBeCalled();
			expect(mockEm.flush).toBeCalled();
		});
	});
	it("should get user list", () => {
		const findmanySpy = mockUserRepo.findAndPaginate.mockResolvedValue({
			results: [],
			total: 100,
		});

		service.findAll(queryDto).subscribe(result => {
			expect(result.meta).toBeDefined();
			expect(result.links).toBeDefined();
			expect(result.items).toStrictEqual([]);
			expect(findmanySpy).toHaveBeenCalled();
		});
	});

	it("should remove user", () => {
		service.remove("userId").subscribe(result => {
			expect(result).toStrictEqual({
				...mockedUser,
				idx: "userId",
				isObsolete: true,
				deletedAt: expect.any(Date),
			});
			expect(mockUserRepo.findOne).toBeCalledWith({
				idx: "userId",
				isActive: true,
				isObsolete: false,
			});

			expect(mockUserRepo.softRemoveAndFlush).toBeCalled();
		});
	});
});
