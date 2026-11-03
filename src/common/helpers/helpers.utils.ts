import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import process from "node:process";

import { AuthenticationResponse } from "@common/@types/index.js";
import { UTCDate } from "@date-fns/utc";
import { User } from "@entities";
import { pick } from "helper-fns";
import { Observable } from "rxjs";
import { from } from "rxjs";
import sharp from "sharp";

// scrypt is memory-hard and ships with Node, so no native argon2 module is needed.
const SCRYPT_SALT_BYTES = 16;
const SCRYPT_KEY_BYTES = 32;

interface ScryptParams {
  N: number;
  r: number;
  p: number;
}

function deriveKey(password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  // Headroom over the 128*N*r bytes scrypt needs, which also clears Node's 32 MiB maxmem default.
  const maxmem = 256 * params.N * params.r;

  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_BYTES, { ...params, maxmem }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function verifyScryptHash(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, n, r, p, saltB64, keyB64] = storedHash.split("$");

  // Rows hashed before the argon2 removal cannot be verified here; those users must reset.
  if (algorithm !== "scrypt") return false;

  const params = { N: Number(n), r: Number(r), p: Number(p) };

  // Fail closed on malformed or absurd params instead of attempting a huge allocation.
  if (![params.N, params.r, params.p].every((value) => Number.isSafeInteger(value) && value > 0))
    return false;
  if (params.N > 2 ** 20 || params.r > 32 || params.p > 16) return false;

  const expectedKey = Buffer.from(keyB64 ?? "", "base64");
  const derivedKey = await deriveKey(password, Buffer.from(saltB64 ?? "", "base64"), params);

  return derivedKey.length === expectedKey.length && timingSafeEqual(derivedKey, expectedKey);
}

export const HelperService = {
  buildPayloadResponse(
    user: User,
    accessToken: string,
    refreshToken?: string,
  ): AuthenticationResponse {
    return {
      accessToken,
      user: {
        ...pick(user, ["id", "idx"]),
      },
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    };
  },

  /* The `isDev()` function is checking if the value of the `NODE_ENV` environment variable starts with
the string "dev". It returns `true` if the environment is set to development, and `false` otherwise.
This function is used to determine if the application is running in a development environment. */
  isDev(): boolean {
    return process.env.NODE_ENV?.startsWith("dev") ?? false;
  },

  /* The `isProd()` function is checking if the value of the `NODE_ENV` environment variable starts with
the string "prod". It returns `true` if the environment is set to production, and `false` otherwise.
This function is used to determine if the application is running in a production environment.
`orm.config.ts` evaluates it at import time, so an unset NODE_ENV must not throw here. */
  isProd(): boolean {
    return process.env.NODE_ENV?.startsWith("prod") ?? false;
  },

  /* Hashes a password with scrypt using a fresh random salt, storing the cost params inline as
  `scrypt$N$r$p$salt$key` so verification stays self-describing. */
  async hashString(userPassword: string): Promise<string> {
    const params: ScryptParams = { N: 2 ** 15, r: 8, p: 1 };
    const salt = randomBytes(SCRYPT_SALT_BYTES);
    const derivedKey = await deriveKey(userPassword, salt, params);

    return [
      "scrypt",
      params.N,
      params.r,
      params.p,
      salt.toString("base64"),
      derivedKey.toString("base64"),
    ].join("$");
  },

  /* Compares a plaintext password against the stored hash; returns false for any hash that is not a
  well-formed scrypt record rather than throwing. */
  verifyHash(userPassword: string, passwordToCompare: string): Observable<boolean> {
    return from(verifyScryptHash(userPassword, passwordToCompare));
  },

  /* The `generateThumb` function takes an input image as a `Buffer` and a configuration object
  containing the desired height and width of the thumbnail. It uses the `sharp` library to resize the
  input image according to the provided configuration. The resized image is then converted to the PNG
  format and returned as a `Buffer` wrapped in an `Observable`. */
  generateThumb(input: Buffer, config: { height: number; width: number }): Observable<Buffer> {
    return from(sharp(input).resize(config).toFormat("png").toBuffer());
  },

  /* The `getTimeInUtc` function takes a `Date` object or a string representation of a date as input and
  returns a new `Date` object representing the same date and time in UTC timezone. */
  getTimeInUtc(date: Date | string): Date {
    const thatDate = date instanceof Date ? date : new Date(date);
    const currentUtcTime = new UTCDate(thatDate);

    return new Date(currentUtcTime.toString());
  },
};
