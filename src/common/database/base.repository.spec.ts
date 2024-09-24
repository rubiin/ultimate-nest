import type { EntityManager } from "@mikro-orm/core"
import type { PostgreSqlDriver } from "@mikro-orm/postgresql"
import { User } from "@entities"

import { createMock } from "@golevelup/ts-jest"
import { loggedInUser } from "@mocks"
import { BaseRepository } from "./base.repository"

describe("baseRepository", () => {
  const mockEm = createMock<EntityManager<PostgreSqlDriver>>({
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
  })

  const userRepo = new BaseRepository(mockEm, User)

  it("should be defined", () => {
    expect(userRepo).toBeDefined()
  })

  it("should softremove and flush", async () => {
    userRepo.softRemoveAndFlush(loggedInUser).subscribe((result) => {
      expect(result.isDeleted).toEqual(true)
      expect(result.deletedAt).toBeInstanceOf(Date)
    })
  })

  it("should softremove", () => {
    userRepo.softRemove(loggedInUser)

    expect(loggedInUser.isDeleted).toEqual(true)
  })
})
