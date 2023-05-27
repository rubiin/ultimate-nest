import { BaseEntity } from "@common/database";
import { Entity, Index, Property, Unique } from "@mikro-orm/core";

@Entity()
export class Subscriber extends BaseEntity {
	@Property()
	@Index()
	@Unique()
	email!: string;
}
