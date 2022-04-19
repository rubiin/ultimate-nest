import { AppRoles } from "@common/constants/app.roles";
import { faker } from "@mikro-orm/seeder";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.enableShutdownHooks();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				transform: true,
			}),
		);
		await app.init();
	});

	describe("if user is logged in as (ADMIN)", () => {
		let jwttoken: string;

		const userDto = {
			firstName: faker.name.firstName(),
			lastName: faker.name.firstName(),
			email: faker.internet.email(),
			roles: [AppRoles.AUTHOR],
			password: faker.internet.password(
				9,
				false,
				/(!|\?|&|\[|]|%|\$|[\dA-Za-z])/,
			),
		};

		it("should login and admin user /auth/login (POST)", () => {
			return request(app.getHttpServer())
				.post("/auth/login")
				.send({
					email: "roobin.bhandari@gmail.com",
					password: "Test@1234",
				})
				.expect(({ body }) => {
					expect(body.user).toBeDefined();
					expect(body.user.id).toEqual(1);
					expect(body.payload).toBeDefined();
					jwttoken = body.payload.access_token;
				})
				.expect(201);
		});

		it("should get a list of all user posts /post (GET)", () => {
			return request(app.getHttpServer())
				.get("/post")
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
				})
				.expect(200);
		});
		it("should get a list of all user /users (GET)", () => {
			return request(app.getHttpServer())
				.get("/user")
				.expect(200)
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
				});
		});

		it("should create a user /users (POST)", () => {
			return request(app.getHttpServer())
				.post("/user")
				.expect(200)
				.field("firstName", userDto.firstName)
				.field("lastName", userDto.lastName)
				.field("password", userDto.password)
				.field("email", userDto.email)
				.field("roles", userDto.roles)
				.expect(({ body }) => {
					expect(body.idx).toBeDefined();
					expect(body.email).toEqual(userDto.email);
					expect(body.avatar).toMatch(
						/^http:\/\/res.cloudinary.com+/,
					);
				})
				.auth(jwttoken, { type: "bearer" });
		});
	});
});
