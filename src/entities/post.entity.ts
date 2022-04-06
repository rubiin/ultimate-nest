import { BaseEntity } from "@common/database/base-entity.entity";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { User } from "./user.entity";
@Entity()
export class Post extends BaseEntity {
	@Property()
	slug!: string;

	@Property()
	title!: string;

	@Property()
	excerpt?: string;

	@Property()
	content!: string;

	@Property()
	category: string;

	@Property({ type: "simple-array" })
	tags: string[];

	@Property()
	status = true;

	@ManyToOne()
	author: User;
}
