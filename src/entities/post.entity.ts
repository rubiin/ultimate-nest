import { BaseEntity } from "@common/database/base-entity.entity";
import { ArrayType, Entity, ManyToOne, Property } from "@mikro-orm/core";

import { User } from "./user.entity";
@Entity()
export class Post extends BaseEntity {
	@Property()
	slug!: string;

	@Property()
	title!: string;

	@Property()
	excerpt?: string;

	@Property({ type: "text" })
	content!: string;

	@Property({ type: ArrayType })
	tags: string[];

	@Property()
	status = true;

	@ManyToOne({ eager: true })
	author: User;
}
