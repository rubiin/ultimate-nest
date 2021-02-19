import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities';
import { pick } from '@rubiin/js-utils';
import { Pool, spawn, Worker } from 'threads';
import * as eta from 'eta';
import { Password } from '../misc/workers/password';
import { HttpException, InternalServerErrorException } from '@nestjs/common';

const passwordPool = Pool(
	() =>
		spawn<Password>(new Worker('../misc/workers/password'), {
			timeout: 30000,
		}),
	1 /* optional size */,
);

export class HelperService {
	/**
	 *
	 *
	 * @static
	 * @param {User} user
	 * @param {string} accessToken
	 * @param {string} [refreshToken]
	 * @returns {AuthenticationPayload}
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

	static async hashString(str: string): Promise<string> {
		return passwordPool
			.queue(async auth => auth.hashString(str))
			.then(result => {
				return result;
			})
			.catch(_err => {
				throw new InternalServerErrorException();
			})
			.finally(async () => await passwordPool.completed());
	}

	/**
	 *
	 *
	 * @static
	 * @param {unknown} data
	 * @param {string} path
	 * @returns {(Promise<string | void>)}
	 * @memberof HelperService
	 */
	static async renderTemplate(
		data: unknown,
		path: string,
	): Promise<string | void> {
		try {
			return eta.renderFileAsync(path, { data }, { cache: true });
		} catch (e) {
			throw e;
		}
	}
}
