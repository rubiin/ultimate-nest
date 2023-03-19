import { Roles } from "@common/@types";
import { BaseEntity } from "@common/database";
import { HelperService } from "@common/helpers";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	EventArgs,
	ManyToMany,
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
	username!: string;

	@Unique()
	@Property({ length: 255 })
	email!: string;

	@Property({ length: 255 })
	avatar!: string;

	@Property({ hidden: true })
	password!: string;

	@Property({ length: 255 })
	twoFactorSecret?: string;

	@Property()
	isTwoFactorEnabled = false;

	@Enum({ items: () => Roles, array: true, default: [Roles.AUTHOR] })
	roles: Roles[] = [Roles.AUTHOR];

	@Unique()
	@Property()
	mobileNumber?: string;

	@Property()
	isVerified = false;

	@OneToMany(() => Post, post => post.author)
	posts = new Collection<Post>(this);

	@ManyToMany({ hidden: true })
	favorites = new Collection<Post>(this);

	@ManyToMany({
		entity: () => User,
		inversedBy: u => u.followed,
		owner: true,
		pivotTable: "user_to_follower",
		joinColumn: "follower",
		inverseJoinColumn: "following",
		hidden: true,
	})
	followers = new Collection<User>(this);

	@ManyToMany(() => User, u => u.followers)
	followed = new Collection<User>(this);

	constructor(data?: Pick<User, "idx">) {
		super();
		Object.assign(this, data);
	}

	toJSON() {
		const o = wrap<User>(this).toObject();

		o.avatar =
			this.avatar ||
			`https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;

		return o;
	}

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword(arguments_: EventArgs<this>) {
		if (arguments_.changeSet?.payload?.password) {
			this.password = await HelperService.hashString(this.password);
		}
	}
}
