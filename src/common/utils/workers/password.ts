import { expose } from 'threads/worker';

import { hash, argon2d } from 'argon2';

const password = {
	hashString(value: string): Promise<string> {
		return hash(value, {
			type: argon2d,
			hashLength: 50,
			saltLength: 32,
			timeCost: 4,
		});
	},
};

export type Password = typeof password;

expose(password);
