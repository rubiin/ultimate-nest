import { User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { EntityManager } from "@mikro-orm/postgresql";
import { mockedUser } from "@mocks";

import { BaseRepository } from "./base.repository";

describe("BaseRepository", () => {
	const loggedInUser = new User(mockedUser);

	const mockEm = createMock<EntityManager>({
		findAndCount: jest.fn().mockResolvedValue([[], 0]),
	});

	const userRepo = new BaseRepository(mockEm, User);

	it("should be defined", () => {
		expect(userRepo).toBeDefined();
	});

	it("should softremove and flush", async () => {
		const result = await userRepo.softRemoveAndFlush(loggedInUser);

		expect(result.isObsolete).toEqual(true);
		expect(result.deletedAt).toBeInstanceOf(Date);
	});

	it("should softremove", () => {
		userRepo.softRemove(loggedInUser);

		expect(loggedInUser.isObsolete).toEqual(true);
	});
});
