import { BaseEntity } from "@common/database";
import { Entity, Index, Property, Unique } from "@mikro-orm/core";

@Entity()
export class NewsLetter extends BaseEntity {
	@Index()
	@Unique()
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
