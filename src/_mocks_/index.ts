import { PageOptionsDto } from "@common/classes/pagination";
import { Order, Roles } from "@common/types/enums";

export const mockedUser = {
	idx: "idx",
	username: "username",
	password: "password",
	firstName: "firstName",
	lastName: "lastName",
	email: "email",
	avatar: "avatar",
	roles: [Roles.ADMIN],
	mobileNumber: "mobileNumber",
};

export const mockedPost = {
	slug: "slug",
	title: "title",
	description: "description",
	content: "content",
	tags: ["tag1", "tag2"],
};

export const query: PageOptionsDto = {
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
} as Express.Multer.File;

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
