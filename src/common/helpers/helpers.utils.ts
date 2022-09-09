import { IAuthenticationPayload } from "@common/types/interfaces/authentication.interface";
import { RandomTypes } from "@common/types/enums/misc.enum";
import { User } from "@entities";
import { verify } from "argon2";
import { pick, slugify } from "helper-fns";
import { customAlphabet } from "nanoid/async";
import { from, Observable } from "rxjs";
import sharp from "sharp";

export const HelperService = {
	/**
	 *
	 *
	 * @param {*} op
	 * @param {...any[]} args
	 * @return {*}  {*}
	 */
	makeTask: (op: any, ...arguments_: any[]): any => {
		return { op, args: arguments_ };
	},

	/**
	 *
	 *
	 * @param {Record<string,any>} obj
	 * @return {*}
	 */
	dispatcher: (object: Record<string, any>) => {
		return async ({ op, args }) => {
			return await object[op](...args);
		};
	},

	/* A function that returns an object. */
	buildPayloadResponse: (
		user: User,
		accessToken: string,
		refreshToken?: string,
	): IAuthenticationPayload => {
		return {
			user: {
				...pick(user, ["id", "idx", "email"]),
			},
			payload: {
				access_token: accessToken,
				...(refreshToken ? { refresh_token: refreshToken } : {}),
			},
		};
	},

	/* A function that returns an observable that resolves to a boolean. */
	verifyHash: (userPassword: string, passwordToCompare: string): Observable<boolean> => {
		return from(verify(userPassword, passwordToCompare));
	},

	/* Generating a thumbnail from a buffer. */
	generateThumb: (input: Buffer, config: { height: number; width: number }): Promise<Buffer> => {
		return sharp(input).resize(config).toFormat("png").toBuffer();
	},

	/* A function that returns a promise that resolves to a random number or string. */
	getRandom: (type: RandomTypes, length: number, alphabet?: string): Promise<number | string> => {
		if (alphabet) {
			return customAlphabet(alphabet, length)();
		}

		return customAlphabet(
			type === RandomTypes.NUMBER
				? "1234567890"
				: // eslint-disable-next-line no-secrets/no-secrets
				  "abcdefghijklmnopqrstuvwxyz",
			length,
		)();
	},

	/* Converting an enum to a string. */
	enumToString: (value: Record<string, any>): string[] => {
		const length = Object.keys(value).length;

		return Object.keys(value).splice(length / 2, length);
	},

	/* Generating a slug from a string. */
	generateSlug: (value: string): string => {
		return slugify(value);
	},
};
