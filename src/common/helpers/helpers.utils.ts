import { existsSync } from "node:fs";
import { join } from "node:path";

import { AuthenticationResponse } from "@common/@types";
import { User } from "@entities";
import { argon2id, hash, Options as ArgonOptions, verify } from "argon2";
import { format, zonedTimeToUtc } from "date-fns-tz";
import { pick } from "helper-fns";
import { RedisOptions } from "ioredis";
import { from, Observable } from "rxjs";
import sharp from "sharp";

const argon2Options: ArgonOptions & { raw?: false } = {
	type: argon2id,
	hashLength: 50,
	saltLength: 32,
	timeCost: 4,
};

export const HelperService = {
	isArray: <T>(value: unknown): value is T[] => {
		return Array.isArray(value);
	},
	buildPayloadResponse(
		user: User,
		accessToken: string,
		refreshToken?: string,
	): AuthenticationResponse {
		return {
			user: {
				...pick(user, ["id", "idx"]),
			},
			accessToken: accessToken,
			...(refreshToken ? { refresh_token: refreshToken } : {}),
		};
	},

	verifyHash(userPassword: string, passwordToCompare: string): Observable<boolean> {
		return from(verify(userPassword, passwordToCompare, argon2Options));
	},

	isDev(): boolean {
		return process.env.NODE_ENV.startsWith("dev");
	},

	isProd(): boolean {
		return process.env.NODE_ENV.startsWith("prod");
	},

	getAppRootDir() {
		let currentDirectory = __dirname;

		while (!existsSync(join(currentDirectory, "resources"))) {
			currentDirectory = join(currentDirectory, "..");
		}

		return process.env.NODE_ENV === "prod" ? join(currentDirectory, "dist") : currentDirectory;
	},

	formatSearch(search: string): string {
		return `%${search.trim().replaceAll("\n", " ").replaceAll(/\s\s+/g, " ").toLowerCase()}%`;
	},

	hashString(userPassword: string): Promise<string> {
		return hash(userPassword, argon2Options);
	},

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
