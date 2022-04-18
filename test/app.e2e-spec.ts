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

		it("/auth/login (POST)", () => {
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

		it("/post (GET)", () => {
			return request(app.getHttpServer())
				.get("/post")
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
				})
				.expect(200);
		});
		it("/users (GET)", () => {
			return request(app.getHttpServer())
				.get("/user")
				.expect(200)
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
				})
				.auth(jwttoken, { type: "bearer" });
		});
	});
});
