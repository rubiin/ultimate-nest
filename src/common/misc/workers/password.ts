import { argon2d, hash } from 'argon2';

export default function hashString(value: string): Promise<string> {
	return hash(value, {
		type: argon2d,
		hashLength: 50,
		saltLength: 32,
		timeCost: 4,
	});
}
