import { IFile, Order, Roles } from "@common/@types";
import { BaseRepository } from "@common/database";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { Category, Comment, OtpLog, Post, RefreshToken, Tag, User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { createMock } from "@golevelup/ts-jest";
import { CacheService } from "@lib/cache/cache.service";
import { MailerService } from "@lib/mailer/mailer.service";
import { EntityManager } from "@mikro-orm/postgresql";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CloudinaryService } from "nestjs-cloudinary";
import { of } from "rxjs";

export const mockedUser = {
	idx: "idx",
	username: "username",
	password: "password",
	firstName: "firstName",
	lastName: "lastName",
	email: "email",
	avatar: "avatar",
	twoFactorSecret: "someSecret",
	mobileNumber: "0123456789",
	isTwoFactorEnabled: true,
	roles: [Roles.ADMIN],
};

export const refreshTokenPayload = {
	jti: 1,
	sub: 1,
	iat: 1,
	exp: 1,
	aud: "nestify",
	iss: "nestify",
};

export const mockedPost = {
	slug: "slug",
	title: "title",
	description: "description",
	content: "content",
};

export const queryDto: PageOptionsDto = {
	page: 1,
	limit: 10,
	offset: 5,
	sort: "createdAt",
	order: Order.DESC,
};

export const mockFile = {
	fieldname: "file",
	originalname: "test.png",
	encoding: "8bit",
	mimetype: "text/png",
	buffer: Buffer.from(__dirname + "/../../test/test.png", "utf8"),
	size: 13_148,
} as IFile;

export const mockedOtpLog = {
	expiresIn: new Date(),
	otpCode: "12344",
	isUsed: false,
};

export const mockResetPasswordDto = {
	password: "Password@1234",
	confirmPassword: "Password@1234",
	otpCode: "123456",
};

export const loggedInUser = new User(mockedUser);

export const refreshToken = new RefreshToken({
	user: loggedInUser,
	expiresIn: new Date(),
	isRevoked: false,
});

export const mockEm = createMock<EntityManager>();
export const mockRequest = createMock<Request>();
export const mockResponse = createMock<Response>();
export const mockAmqConnection = createMock<AmqpConnection>();
export const mockCloudinaryService = createMock<CloudinaryService>();
export const mockConfigService = createMock<ConfigService>();
export const mockCacheService = createMock<CacheService>();
export const mockUserRepo = createMock<BaseRepository<User>>();
export const mockJwtService = createMock<JwtService>();
export const mockRefreshRepo = createMock<RefreshTokensRepository>();
export const mockPostRepo = createMock<BaseRepository<Post>>();
export const mockCommentRepo = createMock<BaseRepository<Comment>>();
export const mockTagsRepo = createMock<BaseRepository<Tag>>();
export const mockCategoryRepo = createMock<BaseRepository<Category>>();
export const mockMailService = createMock<MailerService>();
export const mockTokenService = createMock<TokensService>();
export const mockOtpLogRepo = createMock<BaseRepository<OtpLog>>();
export const mockContext = createMock<ExecutionContext>({});
export const mockReflector = createMock<Reflector>();
export const mockNext = createMock<CallHandler>({
	handle: jest.fn(() => of({})),
});

// mocks for orm functions

mockUserRepo.assign.mockImplementation((entity, dto) => {
	return Object.assign(entity, dto);
});

mockPostRepo.findOne.mockImplementation((options: any) =>
	Promise.resolve({
		...mockedPost,
		idx: options.idx,
	} as any),
);

mockPostRepo.softRemoveAndFlush.mockImplementation(entity => {
	Object.assign(entity, { deletedAt: new Date(), isObsolete: true });

	return Promise.resolve(entity);
});

mockOtpLogRepo.findOne.mockImplementation((options: any) =>
	Promise.resolve({
		user: loggedInUser,
		idx: options.idx,
	} as any),
);
