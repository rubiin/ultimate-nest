import { Buffer } from "node:buffer";

import { User } from "@entities";
import { lastValueFrom } from "rxjs";

import { HelperService } from "./helpers.utils";

describe("helperService", () => {
  describe("buildPayloadResponse", () => {
    const user = new User({ id: 1, idx: "some-idx", username: "alice" });

    it("should include the user id and idx with the access token", () => {
      const result = HelperService.buildPayloadResponse(user, "access-token");

      expect(result).toEqual({
        accessToken: "access-token",
        user: { id: 1, idx: "some-idx" },
      });
    });

    it("should include the refresh token when provided", () => {
      const result = HelperService.buildPayloadResponse(user, "access-token", "refresh-token");

      expect(result).toEqual({
        accessToken: "access-token",
        refresh_token: "refresh-token",
        user: { id: 1, idx: "some-idx" },
      });
    });

    it("should not leak other user fields", () => {
      const result = HelperService.buildPayloadResponse(user, "access-token");

      expect(result.user).not.toHaveProperty("username");
      expect(result.user).not.toHaveProperty("password");
    });
  });

  describe("isDev", () => {
    const original = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = original;
    });

    it("should be true for a development environment", () => {
      process.env.NODE_ENV = "development";

      expect(HelperService.isDev()).toBe(true);
    });

    it("should be true for the dev shorthand", () => {
      process.env.NODE_ENV = "dev";

      expect(HelperService.isDev()).toBe(true);
    });

    it("should be false in production", () => {
      process.env.NODE_ENV = "production";

      expect(HelperService.isDev()).toBe(false);
    });
  });

  describe("isProd", () => {
    const original = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = original;
    });

    // Both "prod" and "production" match, since the check is a prefix match.
    it("should be true for prod and production", () => {
      process.env.NODE_ENV = "prod";
      expect(HelperService.isProd()).toBe(true);

      process.env.NODE_ENV = "production";
      expect(HelperService.isProd()).toBe(true);
    });

    it("should be false in development", () => {
      process.env.NODE_ENV = "development";

      expect(HelperService.isProd()).toBe(false);
    });
  });

  describe("getTimeInUtc", () => {
    it("should accept a Date and return a Date", () => {
      const result = HelperService.getTimeInUtc(new Date("2020-06-07T14:34:08.700Z"));

      expect(result).toBeInstanceOf(Date);
      expect(Number.isNaN(result.getTime())).toBe(false);
    });

    // NOTE: `@date-fns/utc` v2.1.1 drops the millisecond component, so the result
    // is second-precision. Pinned as-is rather than asserted to the millisecond.
    it("should accept a date string", () => {
      const result = HelperService.getTimeInUtc("2020-06-07T14:34:08.700Z");

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toEqual("2020-06-07T14:34:08.000Z");
    });

    it("should produce the same instant for equivalent inputs", () => {
      const date = new Date("2020-06-07T14:34:08.700Z");

      expect(HelperService.getTimeInUtc(date).getTime()).toEqual(
        HelperService.getTimeInUtc("2020-06-07T14:34:08.700Z").getTime(),
      );
    });
  });

  describe("hashString", () => {
    it("should return an argon2id phc string", async () => {
      const hashed = await HelperService.hashString("Password@1234");

      expect(hashed.startsWith("$argon2id$")).toBe(true);
    });

    it("should produce a different hash for the same password each time", async () => {
      const first = await HelperService.hashString("Password@1234");
      const second = await HelperService.hashString("Password@1234");

      expect(first).not.toEqual(second);
    });
  });

  describe("verifyHash", () => {
    // BUG (pinned, not fixed here): argon2's signature is `verify(digest, password)`,
    // but `verifyHash` passes `(userPassword, passwordToCompare)`. The plaintext is
    // therefore parsed as a phc digest and every call rejects with
    // "pchstr must contain a $ as first char", so login can never succeed.
    it("should reject even for a matching password because the arguments are swapped", async () => {
      const hashed = await HelperService.hashString("Password@1234");

      await expect(
        lastValueFrom(HelperService.verifyHash("Password@1234", hashed)),
      ).rejects.toThrow(/pchstr/);
    });

    it("should reject for a mismatched password", async () => {
      const hashed = await HelperService.hashString("Password@1234");

      await expect(
        lastValueFrom(HelperService.verifyHash("wrong-password", hashed)),
      ).rejects.toThrow(/pchstr/);
    });
  });

  describe("generateThumb", () => {
    it("should return a png buffer", async () => {
      // 1x1 transparent png.
      const input = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );

      const result = await lastValueFrom(
        HelperService.generateThumb(input, { height: 1, width: 1 }),
      );

      expect(Buffer.isBuffer(result)).toBe(true);
      // PNG magic number.
      expect(result.subarray(1, 4).toString()).toEqual("PNG");
    });
  });
});
