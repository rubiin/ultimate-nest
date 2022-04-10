import { AppRoles } from "@common/constants/app.roles";
import { BaseEntity } from "@common/database/base-entity.entity";
import { HelperService } from "@common/helpers/helpers.utils";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	OneToMany,
	Property,
	Unique,
	wrap,
} from "@mikro-orm/core";
import { Post } from "./post.entity";

@Entity()
export class User extends BaseEntity {
	@Property({ length: 255 })
	firstName = "";

	@Property({ length: 255 })
	lastName = "";

	@Unique()
	@Property({ length: 255 })
	email!: string;

	@Property({ length: 255 })
	avatar!: string;

	@Property({ hidden: true })
	password!: string;

	@Enum({ items: () => AppRoles, array: true, default: [AppRoles.AUTHOR] })
	roles: AppRoles[] = [AppRoles.AUTHOR];

	@Unique()
	@Property()
	mobileNumber?: string;

	@Property()
	isVerified = false;

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
