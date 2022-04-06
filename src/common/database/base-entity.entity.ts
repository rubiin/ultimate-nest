import { PrimaryKey, Property } from "@mikro-orm/core";
import { Exclude } from "class-transformer";
import { randomUUID } from "crypto";

export abstract class BaseEntity {
	@PrimaryKey({ hidden: true })
	id!: number;

	@Property()
	idx: string = randomUUID();

	@Property()
	isActive = true;

	@Exclude({ toPlainOnly: true })
	@Property()
	isObsolete = false; // deleted status

	@Property()
	deletedAt?: Date;

	@Property()
	createdAt = new Date();

	@Exclude({ toPlainOnly: true })
	@Property({
		onUpdate: () => new Date(),
	})
	updatedAt? = new Date();
}
