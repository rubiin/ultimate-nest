import path from "node:path";

import { Roles } from "@common/@types";
import { faker } from "@mikro-orm/seeder";
import { pick } from "helper-fns";
import request from "supertest";

import { APP_URL } from "../fixtures/constant";
import { user, userDto } from "../fixtures/user";

describe("UserController (e2e)", () => {
	let adminJwtToken: string;
	let userIndex: string;

	const app = APP_URL;

	beforeAll(async () => {
		return request(app)
			.post("/auth/login")
			.send(user.admin)
			.then(({ body }) => {
				adminJwtToken = body.payload.accessToken;
			});
	});

	describe("User", () => {
		it("should create a new user /users (POST)", () => {
			return request(app)
				.post("/users")
				.auth(adminJwtToken, { type: "bearer" })
				.field("firstName", userDto.firstName)
				.field("lastName", userDto.lastName)
				.field("username", userDto.username)
				.field("password", userDto.password)
				.field("email", userDto.email)
				.field("roles[]", userDto.roles)
				.attach("avatar", path.resolve(__dirname, "../test.png"))
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.email).toStrictEqual(userDto.email);
					userIndex = body.id;
				})
				.expect(201);
		});

		it("should self register a new user /users/signup (POST)", () => {
			const email = faker.internet.email();
			const username = faker.internet.userName();

			return request(app)
				.post("/users/signup")
				.send({ ...pick(userDto, ["roles"]), email, username })
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.email).toStrictEqual(email);
					expect(body.roles).toStrictEqual([Roles.AUTHOR]);
					userIndex = body.id;
				})
				.expect(201);
		});

		it("should not allow gender, roles and status /users/signup (POST)", () => {
			return request(app)
				.post("/users/signup")
				.send({
					...pick(userDto, ["roles"]),
					email: faker.internet.email(),
				})
				.expect(({ body }) => {
					expect(body.errors).toStrictEqual(["property roles should not exist"]);
				})
				.expect(400);
		});

		it("should reject duplicate email /users (POST)", () => {
			return request(app)
				.post("/users")
				.auth(adminJwtToken, { type: "bearer" })
				.field("firstName", userDto.firstName)
				.field("lastName", userDto.lastName)
				.field("username", userDto.username)
				.field("password", userDto.password)
				.field("email", userDto.email)
				.field("roles[]", userDto.roles)
				.attach("avatar", path.resolve(__dirname, "../test.png"))
				.expect(({ body }) => {
					expect(body.errors).toContain("email must be unique");
				})
				.expect(400);
		});

		it("should get a list of all user /users (GET)", () => {
			return request(app)
				.get("/users")
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
					expect(body.items).toBeDefined();
				})
				.expect(200);
		});

		it("should get a list of all user with params /user (GET)", () => {
			const page = 2,
				limit = 1;

			return request(app)
				.get(`/users?limit=${limit}&page=${page}`)
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
					expect(body.items).toBeDefined();
					expect(body.meta.currentPage).toStrictEqual(page);
					expect(body.meta.itemsPerPage).toStrictEqual(limit);
				})
				.expect(200);
		});

		it("should get a user with an idx /users (GET)", () => {
			return request(app)
				.get(`/users/${userIndex}`)
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.id).toStrictEqual(userIndex);
				});
		});

		it("should throw error if user not found by idx /users (GET)", () => {
			return request(app)
				.get(`/users/30906d04-d770-4694-b4c1-5c084c0c96f0`)
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body.message).toStrictEqual(
						"User does not exist for the parameter 30906d04-d770-4694-b4c1-5c084c0c96f0.",
					);
				})
				.expect(404);
		});

		it("should update /users (PUT)", () => {
			return request(app)
				.put(`/users/${userIndex}`)
				.auth(adminJwtToken, { type: "bearer" })
				.field("firstName", "Updated First Name")
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.firstName).toStrictEqual("Updated First Name");
				})
				.expect(200);
		});

		it("should delete a user with an idx /users (DELETE)", () => {
			return request(app)
				.delete(`/users/${userIndex}`)
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body).toBeDefined();
					expect(body.id).toStrictEqual(userIndex);
				});
		});
	});
});
