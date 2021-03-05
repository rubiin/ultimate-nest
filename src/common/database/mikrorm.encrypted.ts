import {
	Type,
	Platform,
	EntityProperty,
	ValidationError,
} from '@mikro-orm/core';
import { encrypt, decrypt } from '@rubiin/js-utils';

export class EncryptedType extends Type<string> {
	private readonly encKey = process.env.ENC_KEY;
	private readonly encIV = process.env.ENC_IV;

	convertToDatabaseValue(
		value: string | undefined,
		_platform: Platform,
	): string {
		if (value && !(typeof value.valueOf() === 'string')) {
			throw ValidationError.invalidType(EncryptedType, value, 'JS');
		}

		return encrypt(value.toString(), { key: this.encKey, iv: this.encIV });
	}

	convertToJSValue(value: string, _platform: Platform): string {
		if (!value) {
			return value;
		}

		return decrypt(value, { key: this.encKey, iv: this.encIV });
	}

	getColumnType(property: EntityProperty, _platform: Platform) {
		return `varchar(${property.length})`;
	}
}
