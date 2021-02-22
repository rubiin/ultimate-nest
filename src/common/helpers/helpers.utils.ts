import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities';
import { pick } from '@rubiin/js-utils';
import { Pool, spawn, Worker } from 'threads';
import * as eta from 'eta';
import { Password } from '../misc/workers/password';
import * as sharp from 'sharp';
import puppeteer from 'puppeteer';

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
	 *
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
	 *
	 *
	 * @param {string} str
	 * @returns {Promise<string>}
	 * @memberof UtilService
	 */

	static async hashString(string: string): Promise<string> {
		return passwordPool
			.queue(async auth => auth.hashString(string))
			.then(result => {
				return result;
			})
			.catch(error => {
				console.info(error);
				throw error;
			})
			.finally(async () => await passwordPool.completed());
	}

	/**
	 *
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
		return eta.renderFileAsync(path, { data }, { cache: true });
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
}
