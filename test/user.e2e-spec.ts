import { faker } from "@mikro-orm/seeder";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
	i18nValidationErrorFactory,
	I18nValidationExceptionFilter,
} from "nestjs-i18n";
import path from "node:path";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
	let app: INestApplication;

	afterAll(async () => {
		await app.close();
	});
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
				exceptionFactory: i18nValidationErrorFactory,
			}),
		);

		app.useGlobalFilters(
			new I18nValidationExceptionFilter({ detailedErrors: false }),
		);
		await app.init();
	});

	describe("if user is logged in as (ADMIN)", () => {
		let jwttoken: string;
		let userIndex: string;

		const userDto = {
			firstName: faker.name.firstName(),
			lastName: faker.name.firstName(),
			email: faker.internet.email(),
			username: faker.internet.userName(),
			password: process.env.USER_PASSWORD,
		};

		it("should login an admin user /auth/login (POST)", () => {
			return request(app.getHttpServer())
				.post("/auth/login")
				.send({
					email: "roobin.bhandari@gmail.com",
					password: process.env.USER_PASSWORD,
				})
				.expect(({ body }) => {
					expect(body.user).toBeDefined();
					expect(body.user.id).toEqual(1);
					expect(body.payload).toBeDefined();
					jwttoken = body.payload.access_token;
				})
				.expect(201);
		});

		it("should create a new user /users (POST)", () => {
			return request(app.getHttpServer())
				.post("/users")
				.auth(jwttoken, { type: "bearer" })
				.field("username", userDto.username)
				.field("firstName", userDto.firstName)
				.field("lastName", userDto.lastName)
				.field("email", userDto.email)
				.field("roles[]", ["AUTHOR"])
				.field("password", userDto.password)
				.attach("avatar", path.resolve(__dirname, "./test.png"))
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.email).toEqual(userDto.email);
					userIndex = body.idx;
				})
				.expect(201);
		});

		it("should reject duplicate email /users (POST)", () => {
			return request(app.getHttpServer())
				.post("/users")
				.auth(jwttoken, { type: "bearer" })
				.field("username", userDto.username)
				.field("firstName", userDto.firstName)
				.field("lastName", userDto.lastName)
				.field("email", "roobin.bhandari@gmail.com")
				.field("roles[]", ["AUTHOR"])
				.field("password", userDto.password)
				.attach("avatar", path.resolve(__dirname, "./test.png"))
				.expect(({ body }) => {
					expect(body.message).toEqual(
						"User already registered with email",
					);
				})
				.expect(400);
		});

		it("should get a list of all user /users (GET)", () => {
			return request(app.getHttpServer())
				.get("/users")
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
					expect(body.items).toBeDefined();
				})
				.expect(200);
		});

		it("should get a user with an idx /users (GET)", () => {
			return request(app.getHttpServer())
				.get(`/users/${userIndex}`)
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toEqual(userIndex);
				});
		});

		it("should throw error if user not found by idx /users (GET)", () => {
			return request(app.getHttpServer())
				.get(`/users/30906d04-d770-4694-b4c1-5c084c0c96f0`)
				.expect(({ body }) => {
					expect(body.message).toEqual(
						"User does not exists or unauthorized",
					);
				})
				.expect(404);
		});

		it("should update /users (POST)", () => {
			return request(app.getHttpServer())
				.put(`/users/${userIndex}`)
				.auth(jwttoken, { type: "bearer" })
				.field("roles[]", ["READER"])
				.expect(({ body }) => {
					expect(body).toBeDefined();
				})
				.expect(200);
		});

		it("should delete a user with an idx /users (DELETE)", () => {
			return request(app.getHttpServer())
				.delete(`/users/${userIndex}`)
				.auth(jwttoken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toEqual(userIndex);
				});
		});
	});
});
