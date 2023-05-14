import { AuthenticationResponse } from "@common/@types";
import { User } from "@entities";
import { argon2id, hash, Options as ArgonOptions, verify } from "argon2";
import { pick } from "helper-fns";
import { from, Observable } from "rxjs";
import sharp from "sharp";

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

	formatSearch(search: string): string {
		return `%${search.trim().replaceAll("\n", " ").replaceAll(/\s\s+/g, " ").toLowerCase()}%`;
	},

	hashString(userPassword: string): Promise<string> {
		return hash(userPassword, argon2Options);
	},

	generateThumb(input: Buffer, config: { height: number; width: number }): Observable<Buffer> {
		return from(sharp(input).resize(config).toFormat("png").toBuffer());
	},
};
