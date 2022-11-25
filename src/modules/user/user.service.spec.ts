import { BaseRepository } from "@common/database/base.repository";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { createMock } from "@golevelup/ts-jest";
import { CloudinaryService } from "@lib/cloudinary/cloudinary.service";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockedUser, query } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";

import { UserService } from "./user.service";

describe("UserService", () => {
	let service: UserService;

	const mockI18n = createMock<I18nService>();
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
				{ provide: I18nService, useValue: mockI18n },
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

	it("should getById", async () => {
		const findOneSpy = mockUserRepo.findOne;

		service.getOne("userId").subscribe(result => {
			expect(result).toStrictEqual({ ...mockedUser, idx: "userId" });
			expect(findOneSpy).toBeCalledWith(
				{ idx: "userId", isObsolete: false, isActive: true }
			);
		});
	});

	it("should get user list", async () => {
		const findmanySpy = mockUserRepo.findAndPaginate.mockResolvedValue({
			results: [],
			total: 100,
		});

		service.getMany(query).subscribe(result => {
			expect(result.meta).toBeDefined();
			expect(result.links).toBeDefined();
			expect(result.items).toStrictEqual([]);
			expect(findmanySpy).toHaveBeenCalled();
		});
	});


	it("should remove user", async () => {
		service.deleteOne("userId").subscribe(result => {
			expect(result).toStrictEqual({
				...mockedUser,
				idx: "userId",
				isObsolete: true,
				deletedAt: expect.any(Date),
			});
			expect(mockUserRepo.findOne).toBeCalledWith(
				{ idx: "userId", isObsolete: false, isActive: true }
			);

			expect(mockUserRepo.softRemoveAndFlush).toBeCalled();
		});
	});

});
