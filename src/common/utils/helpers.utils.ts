import { AuthenticationPayload } from '@common/interface/authentication.interface';
import { User } from '@entities/User.entity';

export const isObjectEmpty = (obj: unknown): boolean => {
	return Object.keys(obj).length === 0;
};

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
	const ret: any = {};

	keys.forEach(key => {
		ret[key] = obj[key];
	});

	return ret;
}

export function buildResponsePayload(
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
