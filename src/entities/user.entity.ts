import { Roles } from "@common/@types";
import { BaseEntity } from "@common/database";
import { HelperService } from "@common/helpers";
import { Conversation, Post } from "@entities";
import {
	BeforeCreate,
	BeforeUpdate,
	BeforeUpsert,
	Collection,
	Entity,
	Enum,
	EventArgs,
	Index,
	ManyToMany,
	OneToMany,
	Property,
	Unique,
	wrap,
} from "@mikro-orm/core";

@Unique({ properties: ["email", "mobileNumber"] })
@Entity()
export class User extends BaseEntity {
	@Property()
	firstName!: string;

	@Property()
	middleName?: string;

	@Property()
	lastName!: string;

	@Index()
	@Unique()
	@Property()
	username!: string;

	@Index()
	@Unique()
	@Property()
	email!: string;

	@Property({ columnType: "text" })
	bio!: string;

	@Property({ columnType: "text" })
	avatar!: string;

	@Property({ hidden: true, columnType: "text" })
	password!: string;

	@Property()
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

	@OneToMany(() => Post, post => post.author, {
		orphanRemoval: true,
		eager: false,
		nullable: true,
	})
	posts = new Collection<Post>(this);

	@ManyToMany(() => Conversation, "users", { owner: true })
	conversations = new Collection<Conversation>(this);

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

	@Property()
	lastLogin = new Date();

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
	@BeforeUpsert()
	async hashPassword(arguments_: EventArgs<this>) {
		if (arguments_.changeSet?.payload?.password) {
			this.password = await HelperService.hashString(this.password);
		}
	}
}
