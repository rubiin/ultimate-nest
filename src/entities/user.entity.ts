import { BaseEntity } from "@common/database/base-entity.entity";
import { HelperService } from "@common/helpers/helpers.utils";
import {
	ArrayType,
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	OneToMany,
	Property,
	wrap,
} from "@mikro-orm/core";
import { Post } from "./post.entity";

@Entity()
export class User extends BaseEntity {
	@Property({ length: 255 })
	firstName = "";

	@Property({ length: 255 })
	lastName = "";

	@Property({ length: 255 })
	email!: string;

	@Property({ length: 255 })
	avatar!: string;

	@Property({ hidden: true })
	password!: string;

	@Property({ type: ArrayType })
	roles: string[] = [];

	@Property()
	status = true;

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}

	@OneToMany(() => Post, post => post.author, { hidden: true })
	articles = new Collection<Post>(this);

	toJSON() {
		const o = wrap<User>(this).toObject();

		o.avatar =
			this.avatar ||
			"https://static.productionready.io/images/smiley-cyrus.jpg";

		return o;
	}
}
