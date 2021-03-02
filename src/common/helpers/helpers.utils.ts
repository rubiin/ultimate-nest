import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities';
import { pick } from '@rubiin/js-utils';
import { Pool, spawn, Worker } from 'threads';
import * as eta from 'eta';
import { Password } from '../misc/workers/password';
import * as sharp from 'sharp';
import puppeteer from 'puppeteer';
import { customAlphabet } from 'nanoid/async';
import { randomTypes } from '@common/constants/random-types.enum';

const passwordPool = Pool(
	() =>
		spawn<Password>(new Worker('../misc/workers/password'), {
			timeout: 30000,
		}),
	1 /* optional size */,
);

export class HelperService {
	static puppetterInstance = null;

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
	static buildPayloadResponse(
		user: User,
		accessToken: string,
		refreshToken?: string,
	): AuthenticationPayload {
		return {
			user: {
				...pick(user, ['id', 'idx']),
			},
			payload: {
				access_token: accessToken,
				...(refreshToken ? { refresh_token: refreshToken } : {}),
			},
		};
	}

	/**
	 * hashes string with argon2
	 *
	 * @static
	 * @param {string} string
	 * @return {*}  {Promise<string>}
	 * @memberof HelperService
	 */
	static async hashString(string: string) {
		try {
			let hashed = null;

			passwordPool.queue(async pwd => {
				hashed = await pwd.hashString(string);
			});
			await passwordPool.completed();

			return hashed;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * renders template file with eta
	 *
	 * @static
	 * @param {unknown} data
	 * @param {string} path
	 * @return {(Promise<string | void>)}
	 * @memberof HelperService
	 */
	static async renderTemplate(
		data: unknown,
		path: string,
	): Promise<string | void> {
		return eta.renderFileAsync(
			path,
			{ data },
			{ cache: true, rmWhitespace: true },
		);
	}

	/**
	 *
	 *
	 * @static
	 * @param {Buffer} input
	 * @return {Promise<Buffer>}
	 * @memberof HelperService
	 */
	static async generateThumb(input: Buffer): Promise<Buffer> {
		return sharp(input)
			.resize({ height: 200, width: 200 })
			.toFormat('png')
			.toBuffer();
	}

	/**
	 *
	 *
	 * @static
	 * @returns
	 * @memberof HelperService
	 */

	static async getBrowserInstance() {
		if (this.puppetterInstance) {
			this.puppetterInstance = await puppeteer.launch({
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

		return this.puppetterInstance;
	}

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
	static getRandom(
		type: randomTypes,
		length: number,
		alphabet?: string,
	): Promise<number | string> {
		if (type === randomTypes.NUMBER) {
			return customAlphabet(alphabet ?? '1234567890', length)();
		}

		return customAlphabet(
			// eslint-disable-next-line no-secrets/no-secrets
			alphabet ?? 'abcdefghijklmnopqrstuvwxyz',
			length,
		)();
	}
}
