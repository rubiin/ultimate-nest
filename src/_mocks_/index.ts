import { Buffer } from "node:buffer";
import path from "node:path";

import { File } from "@common/@types";
import { PaginationType, Roles } from "@common/@types";
import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { Category, Comment, Conversation, Message, OtpLog, Post, Tag } from "@entities";
import { NewsLetter, Protocol, Referral, RefreshToken, Subscriber, User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { createMock } from "@golevelup/ts-vitest";
import { CacheService } from "@lib/cache/cache.service";
import { MailerService } from "@lib/mailer/mailer.service";
import { EntityManager, MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ref } from "@mikro-orm/postgresql";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { CloudinaryService } from "nestjs-cloudinary";
import { of } from "rxjs";

export const mockedUser = {
  avatar: "avatar",
  bio: "bio",
  email: "email",
  firstName: "firstName",
  idx: "idx",
  isTwoFactorEnabled: true,
  lastName: "lastName",
  mobileNumber: "0123456789",
  password: "password",
  roles: [Roles.ADMIN],
  twoFactorSecret: "someSecret",
  username: "username",
};

export const refreshTokenPayload = {
  aud: "nestify",
  exp: 1,
  iat: 1,
  iss: "nestify",
  jti: 1,
  sub: 1,
};

export const mockedPost = {
  content: "content",
  description: "description",
  slug: "slug",
  title: "title",
};

export const mockedProtocol = {
  otpExpiryInMinutes: 5,
};

export const queryDto: CursorPaginationDto = {
  fields: [],
  first: 10,
  relations: [],
  search: "",
  type: PaginationType.CURSOR,
  withDeleted: false,
};

export const mockFile = {
  buffer: Buffer.from(path.join(__dirname, "/../../test/test.png"), "utf8"),
  fieldname: "file",
  mimetype: "text/png",
  originalname: "test.png",
  size: 13_148,
} as File;

export const mockedOtpLog = {
  expiresIn: new Date(),
  id: 1,
  isUsed: false,
  otpCode: "12344",
};

export const mockResetPasswordDto = {
  confirmPassword: "Password@1234",
  otpCode: "123456",
  password: "Password@1234",
};

export const loggedInUser = new User(mockedUser);

export const refreshToken = new RefreshToken({
  expiresIn: new Date(),
  isRevoked: false,
  user: ref(loggedInUser),
});

export const protocol = new Protocol(mockedProtocol);

export const mockEm = createMock<EntityManager<PostgreSqlDriver>>();

// `@Transactional()` finds the service's EntityManager with `this.em instanceof EntityManager`,
// which a createMock proxy fails. Giving mockEm the real prototype is not an option: createMock
// would then wrap the real methods instead of auto-mocking them. Recognise mockEm explicitly.
const defaultHasInstance = Function.prototype[Symbol.hasInstance];
Object.defineProperty(EntityManager, Symbol.hasInstance, {
  value(this: typeof EntityManager, instance: unknown) {
    return instance === mockEm || defaultHasInstance.call(this, instance);
  },
});

/**
 * Makes `mockEm.transactional` run its callback and exposes whether a callback is currently
 * running, so a test can assert that EM work happened inside the transaction.
 */
export function trackMockTransaction() {
  let active = false;
  mockEm.transactional.mockImplementation((async (cb: () => Promise<unknown>) => {
    active = true;
    try {
      return await cb();
    } finally {
      active = false;
    }
  }) as never);

  return () => active;
}

const payload = {
  test: "test",
  xss: "<option><iframe></select><b><script>alert(1)</script>",
};
export const mockRequest = createMock<NestifyRequest>({
  body: {
    ...payload,
    password: payload.xss,
  },
  params: payload,
  query: {
    clearCache: "true",
    ...payload,
  },
});

export const mockResponse = createMock<NestifyResponse>();
export const mockAmqConnection = createMock<AmqpConnection>();
export const mockCloudinaryService = createMock<CloudinaryService>();
export const mockConfigService = createMock<ConfigService>();
export const mockCacheService = createMock<CacheService>();
export const mockUserRepo = createMock<BaseRepository<User>>();
export const mockReferralRepo = createMock<BaseRepository<Referral>>();
export const mockJwtService = createMock<JwtService>();
export const mockRefreshRepo = createMock<BaseRepository<RefreshToken>>();
export const mockRefreshTokenRepo = createMock<RefreshTokensRepository>();
export const mockPostRepo = createMock<BaseRepository<Post>>();
export const mockCommentRepo = createMock<BaseRepository<Comment>>();
export const mockTagsRepo = createMock<BaseRepository<Tag>>();
export const mockCategoryRepo = createMock<BaseRepository<Category>>();
export const mockMailService = createMock<MailerService>();
export const mockTokenService = createMock<TokensService>();
export const mockConversationRepo = createMock<BaseRepository<Conversation>>();
export const mockMessageRepo = createMock<BaseRepository<Message>>();
export const mockNewsLetterRepo = createMock<BaseRepository<NewsLetter>>();
export const mockSubscriberRepo = createMock<BaseRepository<Subscriber>>();
export const mockOtpLogRepo = createMock<BaseRepository<OtpLog>>();
export const mockProtocolRepo = createMock<BaseRepository<Protocol>>();
export const mockContext = createMock<ExecutionContext>({});
export const mockReflector = createMock<Reflector>();

// `RequestContext.create` drives real `AsyncLocalStorage`, so a bare
// `createMock<MikroORM>()` would never invoke the wrapped callback. Stand in a
// minimal implementation that just runs it.
export const mockMikroORM = {
  em: mockEm,
} as unknown as MikroORM;

export const mockNext = createMock<CallHandler>({
  handle: vi.fn(() => of({})),
});

// mocks for orm functions
//
// MikroORM's `FilterQuery<T>` is a union that cannot be narrowed by property
// access, and these doubles deliberately return synthetic shapes (e.g. a
// `{ user, idx }` wrapper) rather than real entities. Each implementation is
// therefore cast to the loose mock signature instead of fighting the ORM types.
mockUserRepo.assign.mockImplementation(((entity: Record<string, unknown>, dto: object) =>
  Object.assign(entity, dto)) as never);

mockUserRepo.softRemoveAndFlush.mockImplementation(((entity: Record<string, unknown>) => {
  Object.assign(entity, { deletedAt: new Date(), isDeleted: true });

  return of(entity);
}) as never);

mockUserRepo.findOne.mockImplementation((async (options: { idx?: string; username?: string }) => {
  if ("idx" in options) {
    return {
      idx: options.idx,
      user: mockedUser,
    };
  } else if ("username" in options) {
    return {
      ...mockedUser,
      username: options.username,
    };
  }

  return mockedUser;
}) as never);

mockPostRepo.findOne.mockImplementation((async (options: { title?: string }) => {
  return {
    user: mockedUser,
    ...mockedPost,
    title: options.title,
  };
}) as never);

mockRefreshRepo.findOne.mockImplementation(async () => Promise.resolve(refreshToken));

mockRefreshRepo.nativeUpdate.mockResolvedValueOnce(1);

mockPostRepo.softRemoveAndFlush.mockImplementation(((entity: Record<string, unknown>) => {
  Object.assign(entity, { deletedAt: new Date(), isDeleted: true });

  return of(entity);
}) as never);

mockOtpLogRepo.findOne.mockImplementation((async (options: { idx?: string }) => ({
  idx: options.idx,
  user: mockedUser,
})) as never);

mockProtocolRepo.findOne.mockImplementation((async (options: { idx?: string }) => ({
  ...mockedProtocol,
  idx: options.idx,
})) as never);

mockUserRepo.findAndPaginate.mockImplementation(() =>
  of({
    results: [],
    total: 100,
  }),
);
