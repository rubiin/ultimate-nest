import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities/User.entity';
import { pick } from '@rubiin/js-utils';
import { Pool, spawn } from 'threads';
import { Password } from './workers/password';

const passwordPool = Pool(
	() => spawn<Password>(new Worker('./workers/password'), { timeout: 30000 }),
	1 /* optional size */,
);

export class UtilService {
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
}
