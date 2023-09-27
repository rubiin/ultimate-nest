import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Options as ArgonOptions } from "argon2";
import { argon2id, hash, verify } from "argon2";
import { format, zonedTimeToUtc } from "date-fns-tz";
import { pick } from "helper-fns";
import type { RedisOptions } from "ioredis";
import type { Observable } from "rxjs";
import { from } from "rxjs";
import sharp from "sharp";
import type { User } from "@entities";
import type { AuthenticationResponse } from "@common/@types";

const argon2Options: ArgonOptions & { raw?: false } = {
  type: argon2id,
  hashLength: 50,
  saltLength: 32,
  timeCost: 4,
};

export const HelperService = {
  buildPayloadResponse(
    user: User,
    accessToken: string,
    refreshToken?: string,
  ): AuthenticationResponse {
    return {
      user: {
        ...pick(user, ["id", "idx"]),
      },
      accessToken,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    };
  },

  /* The `isDev()` function is checking if the value of the `NODE_ENV` environment variable starts with
the string "dev". It returns `true` if the environment is set to development, and `false` otherwise.
This function is used to determine if the application is running in a development environment. */
  isDev(): boolean {
    return process.env.NODE_ENV.startsWith("dev");
  },

  /* The `isProd()` function is checking if the value of the `NODE_ENV` environment variable starts with
the string "prod". It returns `true` if the environment is set to production, and `false` otherwise.
This function is used to determine if the application is running in a production environment. */
  isProd(): boolean {
    return process.env.NODE_ENV.startsWith("prod");
  },

  /* The `getAppRootDir()` function is used to determine the root directory of the application. It starts
by setting the `currentDirectory` variable to the value of `__dirname`, which represents the current
directory of the module. */
  getAppRootDir() {
    let currentDirectory = __dirname;

    while (!existsSync(join(currentDirectory, "resources")))
      currentDirectory = join(currentDirectory, "..");

    return process.env.NODE_ENV === "prod" ? join(currentDirectory, "dist") : currentDirectory;
  },

  /* The `hashString` function is used to hash a user's password using the Argon2 algorithm. It takes a
user's password as input and returns a promise that resolves to the hashed password as a string. The
`hash` function from the `argon2` library is used to perform the actual hashing, with the
`userPassword` and `argon2Options` as the input parameters. */
  hashString(userPassword: string): Promise<string> {
    return hash(userPassword, argon2Options);
  },

  /* The `verifyHash` function is used to compare a user's input password with a hashed password. It
takes two parameters: `userPassword`, which is the user's input password, and `passwordToCompare`,
which is the hashed password to compare against. */
  verifyHash(userPassword: string, passwordToCompare: string): Observable<boolean> {
    return from(verify(userPassword, passwordToCompare, argon2Options));
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
    const currentUtcTime = zonedTimeToUtc(thatDate, "UTC");

    return new Date(format(currentUtcTime, "yyyy-MM-dd HH:mm:ss"));
  },

  redisUrlToOptions(url: string): RedisOptions {
    if (url.includes("://:")) {
      const array = url.split("://:")[1].split("@");
      const secondArray = array[1].split(":");

      return {
        password: array[0],
        host: secondArray[0],
        port: Number.parseInt(secondArray[1], 10),
      };
    }

    const connectionString = url.split("://")[1];
    const array = connectionString.split(":");

    return {
      host: array[0],
      port: Number.parseInt(array[1], 10),
    };
  },
};
