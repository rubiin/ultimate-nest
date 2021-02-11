import {
	Type,
	Platform,
	EntityProperty,
	ValidationError,
} from '@mikro-orm/core';
import { encrypt, decrypt } from '@rubiin/js-utils';

export class EncryptedType extends Type<string> {
	private readonly key = '';
	private readonly iv = '';

	convertToDatabaseValue(
		value: string | undefined,
		_platform: Platform,
	): string {
		if (!value) {
			return encrypt(value.toString(), { key: this.key, iv: this.iv });
		}

		throw ValidationError.invalidType(EncryptedType, value, 'JS');
	}

	convertToJSValue(value: string | undefined, _platform: Platform): string {
		if (!value) {
			return decrypt(value, { key: this.key, iv: this.iv });
		}
		throw ValidationError.invalidType(EncryptedType, value, 'database');
	}

	getColumnType(prop: EntityProperty, _platform: Platform) {
		return `varchar(${prop.length})`;
	}
}
