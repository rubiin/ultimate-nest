import { BaseEntity } from "@common/database";
import { Entity, Property, Unique } from "@mikro-orm/core";

@Unique({ properties: ["email"] })
@Entity()
export class Subscriber extends BaseEntity {
	@Property()
	email!: string;
}
