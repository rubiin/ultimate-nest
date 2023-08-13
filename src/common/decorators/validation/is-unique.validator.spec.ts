import { createMock } from '@golevelup/ts-jest'
import { EntityManager } from '@mikro-orm/core'
import { Test } from '@nestjs/testing'

import type { IsUniqueValidationContext } from './is-unique.validator'
import { IsUniqueConstraint } from './is-unique.validator'
import { User } from '@entities'

describe('IsUnique', () => {
  let isUnique: IsUniqueConstraint
  const mockEm = createMock<EntityManager>()
  const username = 'tester'

  const arguments_: IsUniqueValidationContext = {
    object: { username },
    constraints: [() => User, 'username' as never],
    value: username,
    targetName: '',
    property: 'username',
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IsUniqueConstraint, { provide: EntityManager, useValue: mockEm }],
    }).compile()

    isUnique = await module.get<IsUniqueConstraint>(IsUniqueConstraint)
  })

  it('should pass if there are no duplicates', async () => {
    mockEm.count.mockResolvedValue(0)
    const result = await isUnique.validate<User, 'username'>(username, arguments_)

    expect(result).toBeTruthy()
    expect(mockEm.count).toBeCalledWith(User, { username })
  })

  it('should fail if there are  duplicates', async () => {
    mockEm.count.mockResolvedValue(1)
    const result = await isUnique.validate<User, 'username'>(username, arguments_)

    expect(result).toBeFalsy()
    expect(mockEm.count).toBeCalledWith(User, { username })
  })
})
