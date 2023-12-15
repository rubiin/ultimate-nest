import path from "node:path";

import { pick } from "helper-fns";
import request from "supertest";
import type { OffsetPaginationResponse } from "@common/@types";
import { Roles } from "@common/@types";
import { randEmail, randUserName } from "@ngneat/falso";
import type { SuperTestBody } from "../fixtures";
import { APP_URL, user, userDto } from "../fixtures";

describe("UserController (e2e)", () => {
  let adminJwtToken: string;
  let userIndex: string;

  const app = APP_URL;

  beforeAll(async () => {
    const { body } = await request(app)
      .post("/auth/login")
      .send(user.admin) as SuperTestBody<{ payload: {
        accessToken: string
      } }>;

    adminJwtToken = body.payload.accessToken;
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
        .expect(({ body }: SuperTestBody<{ email: string, idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.email).toStrictEqual(userDto.email);
          userIndex = body.idx;
        })
        .expect(201);
    });

    it("should self register a new user /users/signup (POST)", () => {
      const email = randEmail();
      const username = randUserName();

      return request(app)
        .post("/users/signup")
        .send({ ...pick(userDto, ["roles"]), email, username })
        .expect(({ body }: SuperTestBody<{ email: string, idx: string, roles: string[] }>) => {
          expect(body).toBeDefined();
          expect(body.email).toStrictEqual(email);
          expect(body.roles).toStrictEqual([Roles.AUTHOR]);
          userIndex = body.idx;
        })
        .expect(201);
    });

    it("should not allow gender, roles and status /users/signup (POST)", () => {
      return request(app)
        .post("/users/signup")
        .send({
          ...pick(userDto, ["roles"]),
          email: randEmail(),
        })
        .expect(({ body }: SuperTestBody) => {
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
        .expect(({ body }: SuperTestBody) => {
          expect(body.errors).toContain("email must be unique");
        })
        .expect(400);
    });

    it("should get a list of all user /users (GET)", () => {
      return request(app)
        .get("/users")
        .expect(({ body }: SuperTestBody<OffsetPaginationResponse<any>>) => {
          expect(body.meta).toBeDefined();
          expect(body.data).toBeDefined();
        })
        .expect(200);
    });

    it("should get a list of all user with params /user (GET)", () => {
      const page = 2;
      const limit = 1;

      return request(app)
        .get(`/users?limit=${limit}&page=${page}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<OffsetPaginationResponse<any>>) => {
          expect(body.meta).toBeDefined();
          expect(body.data).toBeDefined();
          expect(body.meta.page).toStrictEqual(page);
          expect(body.meta.limit).toStrictEqual(limit);
        })
        .expect(200);
    });

    it("should get a user with an idx /users (GET)", () => {
      return request(app)
        .get(`/users/${userIndex}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.idx).toStrictEqual(userIndex);
        });
    });

    it("should throw error if user not found by idx /users (GET)", () => {
      return request(app)
        .get("/users/30906d04-d770-4694-b4c1-5c084c0c96f0")
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ message: string }>) => {
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
        .expect(({ body }: SuperTestBody<{ firstName: string }>) => {
          expect(body).toBeDefined();
          expect(body.firstName).toStrictEqual("Updated First Name");
        })
        .expect(200);
    });

    it("should delete a user with an idx /users (DELETE)", () => {
      return request(app)
        .delete(`/users/${userIndex}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.idx).toStrictEqual(userIndex);
        });
    });
  });
});
