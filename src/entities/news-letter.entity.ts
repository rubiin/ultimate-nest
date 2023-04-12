import { BaseEntity } from "@common/database";
import { Entity, Property } from "@mikro-orm/core";

@Entity()
export class NewsLetter extends BaseEntity {
	@Property()
	email: string;

	constructor(partial?: Partial<NewsLetter>) {
		super();
		Object.assign(this, partial);
	}
}
