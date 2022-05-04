import { RandomTypes } from "@common/constants/misc.enum";
import { IAuthenticationPayload } from "@common/interfaces/authentication.interface";
import { hashString } from "@common/misc/threads";
import { User } from "@entities";
import argon from "argon2";
import * as eta from "eta";
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

	/**
	 * builds response for login
	 *
	 * @static
	 * @param {User} user
	 * @param {string} accessToken
	 * @param {string} [refreshToken]
	 * @return {AuthenticationPayload}
	 * @memberof UtilService
	 */
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

	/**
	 *
	 * hashes string with argon2
	 *
	 * @static
	 * @param {string} string
	 * @return {*} {(Promise<string>)}
	 * @memberof HelperService
	 */
	hashString: (string: string): Promise<string> => {
		return hashString(string);
	},

	verifyHash: (
		userPassword: string,
		passwordToCompare: string,
	): Observable<boolean> => {
		return from(argon.verify(userPassword, passwordToCompare));
	},

	/**
	 * renders template file with eta
	 * @static
	 * @param {unknown} data
	 * @param {string} path
	 * @return {*}  {(Promise<string | void>)}
	 * @memberof HelperService
	 */
	renderTemplate: (data: unknown, path: string): void | Promise<string> => {
		return eta.renderFileAsync(
			path,
			{ data },
			{ cache: true, rmWhitespace: true },
		);
	},

	/**
	 *
	 *
	 * @static
	 * @param {Buffer} input
	 * @param {{height: number, width: number}} config
	 * @return {*}  {Promise<Buffer>}
	 * @memberof HelperService
	 */
	generateThumb: (
		input: Buffer,
		config: { height: number; width: number },
	): Promise<Buffer> => {
		return sharp(input).resize(config).toFormat("png").toBuffer();
	},

	/**
	 *
	 *
	 * @static
	 * @param {RandomTypes} type
	 * @param {number} length
	 * @param {string} [alphabet]
	 * @return {*}  {(Promise<number | string>)}
	 * @memberof HelperService
	 */
	getRandom: (
		type: RandomTypes,
		length: number,
		alphabet?: string,
	): Promise<number | string> => {
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

	enumToString: (value: Record<string, any>): string[] => {
		const length = Object.keys(value).length;

		return Object.keys(value).splice(length / 2, length);
	},

	generateSlug: (value: string): string => {
		return slugify(value);
	},
};
