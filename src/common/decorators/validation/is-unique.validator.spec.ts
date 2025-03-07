import  { PostgreSqlDriver } from "@mikro-orm/postgresql"
import  { IsUniqueValidationContext } from "./is-unique.validator"
import { User } from "@entities"
import { createMock } from "@golevelup/ts-jest"
import { EntityManager } from "@mikro-orm/core"
import { Test } from "@nestjs/testing"
import { IsUniqueConstraint } from "./is-unique.validator"

describe("isUnique", () => {
  let isUnique: IsUniqueConstraint
  const mockEm = createMock<EntityManager<PostgreSqlDriver>>()
  const username = "tester"

  const validatorArguments: IsUniqueValidationContext = {
    object: { username },
    constraints: [() => User, "username" as never],
    value: username,
    targetName: "",
    property: "username",
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IsUniqueConstraint, { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm }],
    }).compile()

    isUnique = module.get<IsUniqueConstraint>(IsUniqueConstraint)
  })

  it("should pass if there are no duplicates", async () => {
    mockEm.count.mockResolvedValue(0)
    const result = await isUnique.validate<User, "username">(username, validatorArguments)

    expect(result).toBeTruthy()
    expect(mockEm.count).toHaveBeenCalledWith(User, { username })
  })

  it("should fail if there are  duplicates", async () => {
    mockEm.count.mockResolvedValue(1)
    const result = await isUnique.validate<User, "username">(username, validatorArguments)

    expect(result).toBeFalsy()
    expect(mockEm.count).toHaveBeenCalledWith(User, { username })
  })
})
