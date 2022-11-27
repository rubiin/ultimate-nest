import { RandomTypes } from "@common/types/enums/misc.enum";
import { IAuthenticationPayload } from "@common/types/interfaces/authentication.interface";
import { User } from "@entities";
import { verify } from "argon2";
import { pick, slugify } from "helper-fns";
import { from, Observable } from "rxjs";
import sharp from "sharp";

export const dynamicImport = async (packageName: string) =>
	new Function(`return import('${packageName}')`)();

export const HelperService = {
	resourceLink: (resource: string, id: string) => {
		return `${process.env.API_URL}/v1/${resource}/${id}`;
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
	generateThumb: (
		input: Buffer,
		config: { height: number; width: number },
	): Observable<Buffer> => {
		return from(sharp(input).resize(config).toFormat("png").toBuffer());
	},

	/* A function that returns a promise that resolves to a random number or string. */
	getRandom: async (
		type: RandomTypes,
		length: number,
		alphabet?: string,
	): Promise<number | string> => {
		const { customAlphabet } = await dynamicImport("nanoid/async");

		if (alphabet) {
			return customAlphabet(alphabet, length)();
		}

		return customAlphabet(
			type === RandomTypes.NUMBER ? "1234567890" : "abcdefghijklmnopqrstuvwxyz",
			length,
		)();
	},

	/* Generating a slug from a string. */
	generateSlug: (value: string): string => {
		return slugify(value);
	},
};
