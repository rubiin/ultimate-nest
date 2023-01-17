import { IAuthenticationPayload } from "@common/types";
import { User } from "@entities";
import { verify } from "argon2";
import { pick } from "helper-fns";
import { from, Observable } from "rxjs";
import sharp from "sharp";

export const HelperService = {
	resourceLink: (resource: string, id: string) => {
		return `${process.env.API_URL}/v1/${resource}/${id}`;
	},

	buildPayloadResponse: (
		user: User,
		accessToken: string,
		refreshToken?: string,
	): IAuthenticationPayload => {
		return {
			user: {
				...pick(user, ["id", "idx"]),
			},
			access_token: accessToken,
			...(refreshToken ? { refresh_token: refreshToken } : {}),
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
};
