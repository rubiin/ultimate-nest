import { BaseEntity } from "@common/database";
import { Entity, Index, Property, Unique } from "@mikro-orm/core";

@Unique({ properties: ["email"] })
@Entity()
export class NewsLetter extends BaseEntity {
	@Index()
	@Property()
	email: string;

	constructor(partial?: Partial<NewsLetter>) {
		super();
		Object.assign(this, partial);
	}
}
