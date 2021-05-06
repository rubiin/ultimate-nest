import { argon2d, hash } from 'argon2';

export const hashString = (value: string): Promise<string> =>
	hash(value, {
		type: argon2d,
		hashLength: 50,
		saltLength: 32,
		timeCost: 4,
	});
