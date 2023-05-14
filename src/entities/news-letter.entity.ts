import { BaseEntity } from "@common/database";
import { Entity, Index, Property, Unique } from "@mikro-orm/core";

@Unique({ properties: ["name"] })
@Entity()
export class NewsLetter extends BaseEntity {
	@Index()
	@Property()
	name: string;

	@Property({ columnType: "text" })
	content!: string;

	@Property({ type: "date", nullable: true })
	sentAt?: Date;

	constructor(partial?: Partial<NewsLetter>) {
		super();
		Object.assign(this, partial);
	}
}
