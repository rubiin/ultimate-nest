import { IFile, Order, Roles } from "@common/@types";
import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { RefreshToken, User } from "@entities";

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
