import { PrimaryKey, Property } from "@mikro-orm/core";
import { randomUUID } from "crypto";
import { ApiHideProperty } from "@nestjs/swagger";

/* A base class for all entities. */
export abstract class BaseEntity {
	@ApiHideProperty()
	@PrimaryKey()
	id!: number;

	@Property()
	idx: string = randomUUID();

	@Property()
	isActive = true;

	@Property({ hidden: true })
	isObsolete = false; // deleted status, hidden true removed the property during deserialization

	@Property()
	deletedAt?: Date;

	@Property()
	createdAt = new Date();

	@Property({
		onUpdate: () => new Date(),
		hidden: true,
	})
	updatedAt? = new Date();
}
