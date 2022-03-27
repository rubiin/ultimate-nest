import { PrimaryKey, Property } from '@mikro-orm/core';
import { Exclude } from '@nestjs/class-transformer';

export abstract class BaseEntity {
	@PrimaryKey({ hidden: true })
	id!: number;

	@Property({ defaultRaw: 'uuid_generate_v4()' })
	idx: string;

	@Property({
		nullable: false,
		default: true,
	})
	isActive: boolean;

	@Exclude({ toPlainOnly: true })
	@Property({
		nullable: false,
		default: false,
	})
	isObsolete: boolean;

	@Property({ nullable: true })
	deletedAt?: Date;

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
