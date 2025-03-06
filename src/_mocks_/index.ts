import  { File } from "@common/@types"
import  { BaseRepository } from "@common/database"
import  { CursorPaginationDto } from "@common/dtos"
import  { Category, Comment, OtpLog, Post, Tag } from "@entities"
import  { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import  { CacheService } from "@lib/cache/cache.service"
import  { MailerService } from "@lib/mailer/mailer.service"
import  { EntityManager } from "@mikro-orm/core"
import  { FilterQuery, PostgreSqlDriver } from "@mikro-orm/postgresql"
import  { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository"
import  { TokensService } from "@modules/token/tokens.service"
import  { CallHandler, ExecutionContext } from "@nestjs/common"
import  { ConfigService } from "@nestjs/config"
import  { Reflector } from "@nestjs/core"
import  { JwtService } from "@nestjs/jwt"
import  { CloudinaryService } from "nestjs-cloudinary"
import { Buffer } from "node:buffer"
import path from "node:path"
import { PaginationType, Roles } from "@common/@types"
import { Protocol, RefreshToken, User } from "@entities"
import { createMock } from "@golevelup/ts-jest"
import { ref } from "@mikro-orm/postgresql"
import { of } from "rxjs"

export const mockedUser = {
  idx: "idx",
  username: "username",
  password: "password",
  bio: "bio",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  avatar: "avatar",
  twoFactorSecret: "someSecret",
  mobileNumber: "0123456789",
  isTwoFactorEnabled: true,
  roles: [Roles.ADMIN],
}

export const refreshTokenPayload = {
  jti: 1,
  sub: 1,
  iat: 1,
  exp: 1,
  aud: "nestify",
  iss: "nestify",
}

export const mockedPost = {
  slug: "slug",
  title: "title",
  description: "description",
  content: "content",
}

export const mockedProtocol = {
  loginMaxRetry: 5,
  loginAttemptnumbererval: 5,
  loginnumberervalUnit: "m",
  otpExpiryInMinutes: 5,
}

export const queryDto: CursorPaginationDto = {
  first: 10,
  search: "",
  relations: [],
  fields: [],
  type: PaginationType.CURSOR,
  withDeleted: false,
}

export const mockFile = {
  fieldname: "file",
  originalname: "test.png",
  mimetype: "text/png",
  buffer: Buffer.from(path.join(__dirname, "/../../test/test.png"), "utf8"),
  size: 13_148,
} as File

export const mockedOtpLog = {
  id: 1,
  expiresIn: new Date(),
  otpCode: "12344",
  isUsed: false,
}

export const mockResetPasswordDto = {
  password: "Password@1234",
  confirmPassword: "Password@1234",
  otpCode: "123456",
}

export const loggedInUser = new User(mockedUser)

export const refreshToken = new RefreshToken({
  user: ref(loggedInUser),
  expiresIn: new Date(),
  isRevoked: false,
})

export const protocol = new Protocol(mockedProtocol)

export const mockEm = createMock<EntityManager<PostgreSqlDriver>>()

const payload = {
  xss: "<option><iframe></select><b><script>alert(1)</script>",
  test: "test",
}
export const mockRequest = createMock<NestifyRequest>({
  query: {
    clearCache: "true",
    ...payload,
  },
  params: payload,

  body: {
    ...payload,
    password: payload.xss,
  },
})

export const mockResponse = createMock<NestifyResponse>()
export const mockAmqConnection = createMock<AmqpConnection>()
export const mockCloudinaryService = createMock<CloudinaryService>()
export const mockConfigService = createMock<ConfigService>()
export const mockCacheService = createMock<CacheService>()
export const mockUserRepo = createMock<BaseRepository<User>>()
export const mockJwtService = createMock<JwtService>()
export const mockRefreshRepo = createMock<BaseRepository<RefreshToken>>()
export const mockRefreshTokenRepo = createMock<RefreshTokensRepository>()
export const mockPostRepo = createMock<BaseRepository<Post>>()
export const mockCommentRepo = createMock<BaseRepository<Comment>>()
export const mockTagsRepo = createMock<BaseRepository<Tag>>()
export const mockCategoryRepo = createMock<BaseRepository<Category>>()
export const mockMailService = createMock<MailerService>()
export const mockTokenService = createMock<TokensService>()
export const mockOtpLogRepo = createMock<BaseRepository<OtpLog>>()
export const mockProtocolRepo = createMock<BaseRepository<Protocol>>()
export const mockContext = createMock<ExecutionContext>({})
export const mockReflector = createMock<Reflector>()

export const mockNext = createMock<CallHandler>({
  handle: jest.fn(() => of({})),
})

// mocks for orm functions
mockUserRepo.assign.mockImplementation((entity, dto) => {
  return Object.assign(entity, dto)
})

mockUserRepo.softRemoveAndFlush.mockImplementation((entity) => {
  Object.assign(entity, { deletedAt: new Date(), isDeleted: true })

  return of(entity)
})

mockUserRepo.findOne.mockImplementation(async (options: FilterQuery<User>) => {
  if ("idx" in options) {
    return Promise.resolve({
      user: mockedUser,
      idx: options.idx,
    })
  }
  else if ("username" in options) {
    return Promise.resolve({
      ...mockedUser,
      username: options.username,
    })
  }

  return Promise.resolve(mockedUser)
})

mockPostRepo.findOne.mockImplementation(async (options: FilterQuery<Post>) => {
  return Promise.resolve({
    user: mockedUser,
    ...mockedPost,
    title: options.title,
  })
})

mockRefreshRepo.findOne.mockImplementation(async () =>
  Promise.resolve(refreshToken),
)

mockRefreshRepo.nativeUpdate.mockResolvedValueOnce(1)

mockPostRepo.softRemoveAndFlush.mockImplementation((entity) => {
  Object.assign(entity, { deletedAt: new Date(), isDeleted: true })

  return of(entity)
})

mockOtpLogRepo.findOne.mockImplementation(async options =>

  Promise.resolve({
    user: mockedUser,
    idx: options.idx,
  }),
)

mockProtocolRepo.findOne.mockImplementation(async options =>
  Promise.resolve({
    ...mockedProtocol,
    idx: options.idx,
  }),
)

mockUserRepo.findAndPaginate.mockImplementation(() =>
  of({
    results: [],
    total: 100,
  }),
)
