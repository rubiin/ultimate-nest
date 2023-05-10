import { User } from "@entities";
import { createMock } from "@golevelup/ts-jest";
import { EntityManager } from "@mikro-orm/postgresql";
import { loggedInUser } from "@mocks";

import { BaseRepository } from "./base.repository";

describe("BaseRepository", () => {
	const mockEm = createMock<EntityManager>({
		findAndCount: jest.fn().mockResolvedValue([[], 0]),
	});

	const userRepo = new BaseRepository(mockEm, User);

	it("should be defined", () => {
		expect(userRepo).toBeDefined();
	});

	it("should softremove and flush", async () => {
		userRepo.softRemoveAndFlush(loggedInUser).subscribe(result => {
			expect(result.isDeleted).toEqual(true);
			expect(result.deletedAt).toBeInstanceOf(Date);
		});
	});

	it("should softremove", () => {
		userRepo.softRemove(loggedInUser);

		expect(loggedInUser.isDeleted).toEqual(true);
	});
});
