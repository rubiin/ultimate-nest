import { IAuthenticationResponse } from "@common/@types";
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

export const dynamicImport = async (packageName: string) =>
	new Function(`return import('${packageName}')`)();

export const HelperService = {
	buildPayloadResponse: (
		user: User,
		accessToken: string,
		refreshToken?: string,
	): IAuthenticationResponse => {
		return {
			user: {
				...pick(user, ["id", "idx"]),
			},
			accessToken: accessToken,
			...(refreshToken ? { refresh_token: refreshToken } : {}),
		};
	},

	/* A function that returns an observable that resolves to a boolean. */
	verifyHash: (userPassword: string, passwordToCompare: string): Observable<boolean> => {
		return from(verify(userPassword, passwordToCompare, argon2Options));
	},

	/* A function that returns an observable that resolves to a boolean. */
	hashString: (userPassword: string): Promise<string> => {
		return hash(userPassword, argon2Options);
	},

	/* Generating a thumbnail from a buffer. */
	generateThumb: (
		input: Buffer,
		config: { height: number; width: number },
	): Observable<Buffer> => {
		return from(sharp(input).resize(config).toFormat("png").toBuffer());
	},
};
