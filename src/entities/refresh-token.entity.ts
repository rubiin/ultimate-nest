import { BaseEntity } from "@common/database/base-entity.entity";
import { Relation } from "@common/types";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { User } from "./user.entity";

@Entity()
export class RefreshToken extends BaseEntity {
	@Property()
	expiresIn!: Date;

	@ManyToOne()
	user: Relation<User>;

	@Property()
	isRevoked = false;
}
