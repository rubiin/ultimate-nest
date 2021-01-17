import { PrimaryKey, Property } from '@mikro-orm/core';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity {
	@PrimaryKey()
	id!: number;

	@Property({ defaultRaw: 'uuid_generate_v4()' })
	idx: string;

	@Property({
		nullable: false,
		default: true,
	})
	is_active: boolean;

	@Exclude({ toPlainOnly: true })
	@Property({
		nullable: false,
		default: false,
	})
	is_obsolete: boolean;

	@Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
	createdAt: Date = new Date();

	@Exclude({ toPlainOnly: true })
	@Property({
		defaultRaw: 'CURRENT_TIMESTAMP',
		nullable: true,
		onUpdate: () => new Date(),
	})
	updatedAt?: Date = new Date();
}
