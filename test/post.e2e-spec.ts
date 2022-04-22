import { faker } from "@mikro-orm/seeder";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { randomNumber } from "helper-fns";
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
		let postIndex: string;

		const postDto = {
			title: faker.lorem.words(randomNumber(1, 10)),
			content: faker.lorem.paragraph(randomNumber(2, 4)),
			slug: faker.lorem.slug(),
			category: "LIFESTYLE",
			excerpt: faker.lorem.paragraph(randomNumber(1, 2)),
			tags: faker.lorem.words(randomNumber(1, 4)).split(" "),
		};

		it("should login as a user /auth/login (AUTHOR)", () => {
			return request(app.getHttpServer())
				.post("/auth/login")
				.send({
					email: "roobin.bhandari@gmail.com", // change with email of author
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

		it("should get a list of all user posts /post (GET)", () => {
			return request(app.getHttpServer())
				.get("/post")
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
					postIndex = body.items[0].id;
				})
				.expect(200);
		});

		it("should create a new post /post", () => {
			return request(app.getHttpServer())
				.post("/post")
				.auth(jwttoken, { type: "bearer" })
				.send(postDto)
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toBeDefined();
					expect(body.content).toEqual(postDto.content);
					postIndex = body.idx;
				})
				.expect(201);
		});

		it("should get a post with an idx /post (GET)", () => {
			return request(app.getHttpServer())
				.get(`/post/${postIndex}`)
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toEqual(postIndex);
				});
		});

		it("should update a new post /post", () => {
			return request(app.getHttpServer())
				.put(`/post/${postIndex}`)
				.auth(jwttoken, { type: "bearer" })
				.send({
					title: faker.lorem.words(randomNumber(1, 4)),
				})
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toBeDefined();
					expect(body.content).toEqual(postDto.content);
					postIndex = body.idx;
				})
				.expect(200);
		});

		it("should delete a post with an idx /post (DELETE)", () => {
			return request(app.getHttpServer())
				.delete(`/post/${postIndex}`)
				.auth(jwttoken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.idx).toEqual(postIndex);
				});
		});
	});
});
