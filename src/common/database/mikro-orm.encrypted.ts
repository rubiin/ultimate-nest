import process from "node:process";

import { EntityProperty, Platform } from "@mikro-orm/postgresql";
import { Type, ValidationError } from "@mikro-orm/postgresql";
import { decrypt, encrypt, isString } from "helper-fns";

export class EncryptedType extends Type {
  private readonly encKey = process.env.ENC_KEY;
  private readonly encIV = process.env.ENC_IV;

  convertToDatabaseValue(value: string, _platform: Platform): string {
    if (value && !isString(value.valueOf()))
      throw ValidationError.invalidType(EncryptedType, value, "JS");

    return encrypt({ config: { iv: this.encIV, key: this.encKey }, text: value.toString() });
  }

  convertToJSValue(value: string, _platform: Platform): string {
    if (!value) return value;

    return decrypt({ config: { iv: this.encIV, key: this.encKey }, text: value });
  }

  getColumnType(property: EntityProperty, _platform: Platform) {
    return `varchar(${property.length})`;
  }
}
