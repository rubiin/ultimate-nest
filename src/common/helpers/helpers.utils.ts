import { User } from '@entities';
import * as eta from 'eta';
import * as sharp from 'sharp';
import { resolve } from 'path';
import puppeteer from 'puppeteer';
import { pick } from '@rubiin/js-utils';
import { customAlphabet } from 'nanoid/async';
import { randomTypes } from '@common/constants/random-types.enum';
import { IAuthenticationPayload } from '@common/interfaces/authentication.interface';
import slugify from 'slugify'


// eslint-disable-next-line @typescript-eslint/no-var-requires
const Piscina = require('piscina');

const pool = new Piscina();

let puppetterInstance = null;

export /** @type {*} */
/** @type {*} */
const HelperService = {
	/**
	 *
	 *
	 * @param {*} op
	 * @param {...any[]} args
	 * @return {*}  {*}
	 */
	makeTask: (op: any, ...args: any[]): any => {
		return { op, args };
	},

	/**
	 *
	 *
	 * @param {Record<string,any>} obj
	 * @return {*}
	 */
	dispatcher: (obj: Record<string, any>) => {
		return async ({ op, args }) => {
			return await obj[op](...args);
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
				...pick(user, ['id', 'idx']),
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
		try {
			return pool.runTask(
				string,
				resolve(__dirname, '../misc/', 'password'),
			);
		} catch (error) {
			console.info(error);
		}
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
		return sharp(input).resize(config).toFormat('png').toBuffer();
	},

	/**
	 *
	 *
	 * @static
	 * @returns
	 * @memberof HelperService
	 */

	getBrowserInstance: async () => {
		if (puppetterInstance) {
			puppetterInstance = await puppeteer.launch({
				headless: true,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-accelerated-2d-canvas',
					'--no-first-run',
					'--no-zygote',
					'--single-process', // <- this one doesn't works in Windows
					'--disable-gpu',
				],
			});
		}

		return puppetterInstance;
	},

	/**
	 *
	 *
	 * @static
	 * @param {randomTypes} type
	 * @param {number} length
	 * @param {string} [alphabet]
	 * @return {*}  {(Promise<number | string>)}
	 * @memberof HelperService
	 */
	getRandom: (
		type: randomTypes,
		length: number,
		alphabet?: string,
	): Promise<number | string> => {
		if (alphabet) {
			return customAlphabet(alphabet, length)();
		}

		return customAlphabet(
			type === randomTypes.NUMBER
				? '1234567890'
				: // eslint-disable-next-line no-secrets/no-secrets
				  'abcdefghijklmnopqrstuvwxyz',
			length,
		)();
	},


enumToString: (value: Object) : string[]=>{
  const length = Object.keys(value).length;
  return Object.keys(value).splice(length/2,length);
}
,
generateSlug:(value: string): string =>{
return slugify(value, {
  replacement: '-',  // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: false,      // convert to lower case, defaults to `false`
  strict: false,     // strip special characters except replacement, defaults to `false`
})
}

};
