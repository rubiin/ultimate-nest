import { BaseEntity } from "@common/database";
import { Entity, Property, Unique } from "@mikro-orm/core";

@Unique({ properties: ["email"] })
@Entity()
export class NewsLetter extends BaseEntity {
	@Property()
	email: string;

	constructor(partial?: Partial<NewsLetter>) {
		super();
		Object.assign(this, partial);
	}
}
