import type { OffsetPaginationResponse } from "@common/@types";
import request from "supertest";
import type { SuperTestBody } from "../fixtures";
import { APP_URL, postDto, user, userDto } from "../fixtures";

describe("PostController (e2e)", () => {
  let adminJwtToken: string;
  let postIndex: string;

  const app = APP_URL;

  beforeAll(async () => {
    const { body } = await request(app)
      .post("/auth/login")
      .send(user.admin) as SuperTestBody<{ payload: {
        accessToken: string
      } }>;

    adminJwtToken = body.payload.accessToken;
  });

  describe("Post", () => {
    it("should create a new post /posts (POST)", () => {
      return request(app)
        .post("/posts")
        .auth(adminJwtToken, { type: "bearer" })
        .send(postDto)
        .expect(({ body }: SuperTestBody<{ email: string, idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.email).toStrictEqual(userDto.email);
          postIndex = body.idx;
        })
        .expect(201);
    });

    it("should reject duplicate title /posts (POST)", () => {
      return request(app)
        .post("/posts")
        .auth(adminJwtToken, { type: "bearer" })
        .send(postDto)
        .expect(({ body }: SuperTestBody) => {
          expect(body.errors).toContain("title must be unique");
        })
        .expect(400);
    });

    it("should get a list of all user /posts (GET)", () => {
      return request(app)
        .get("/posts")
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<OffsetPaginationResponse<any>>) => {
          expect(body.meta).toBeDefined();
          expect(body.data).toBeDefined();
        })
        .expect(200);
    });

    it("should get a list of all post with params /posts (GET)", () => {
      const page = 2;
      const limit = 1;

      return request(app)
        .get(`/posts?limit=${limit}&page=${page}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<OffsetPaginationResponse<any>>) => {
          expect(body.meta).toBeDefined();
          expect(body.data).toBeDefined();
          expect(body.meta.page).toStrictEqual(page);
          expect(body.meta.limit).toStrictEqual(limit);
        })
        .expect(200);
    });

    it("should get a post with an idx /posts (GET)", () => {
      return request(app)
        .get(`/posts/${postIndex}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.idx).toStrictEqual(postIndex);
        });
    });

    it("should throw error if post not found by idx /posts (GET)", () => {
      return request(app)
        .get("/posts/30906d04-d770-4694-b4c1-5c084c0c96f0")
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ message: string }>) => {
          expect(body.message).toStrictEqual(
            "User does not exist for the parameter 30906d04-d770-4694-b4c1-5c084c0c96f0.",
          );
        })
        .expect(404);
    });

    it("should update /posts (PUT)", () => {
      return request(app)
        .put(`/posts/${postIndex}`)
        .auth(adminJwtToken, { type: "bearer" })
        .send({ content: "updated content" })
        .expect(({ body }: SuperTestBody<{ content: string }>) => {
          expect(body).toBeDefined();
          expect(body.content).toStrictEqual("updated content");
        })
        .expect(200);
    });

    it("should delete a post with an idx /posts (DELETE)", () => {
      return request(app)
        .delete(`/posts/${postIndex}`)
        .auth(adminJwtToken, { type: "bearer" })
        .expect(({ body }: SuperTestBody<{ idx: string }>) => {
          expect(body).toBeDefined();
          expect(body.idx).toStrictEqual(postIndex);
        });
    });
  });
});
