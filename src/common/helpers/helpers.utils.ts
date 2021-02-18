import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities/user.entity';
import { pick } from '@rubiin/js-utils';
import { Pool, spawn, Worker } from 'threads';
import * as eta from 'eta';
import { Password } from '../misc/workers/password';

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
		const hashed = passwordPool.queue(async pwd => {
			return pwd.hashString(str);
		});

		await passwordPool.completed();

		return hashed;
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
		return eta.renderFileAsync(path, { data }, { cache: true });
	}
}
