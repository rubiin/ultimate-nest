import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	EntityDTO,
	ManyToMany,
	OneToMany,
	Property,
	wrap,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Exclude } from 'class-transformer';
import { HelperService } from '@common/helpers/helpers.utils';
import { Post } from './post.entity';

@Entity()
export class User extends BaseEntity {
	@Property({
		length: 50,
	})
	fullName: string;

	@Property({
		length: 250,
		nullable: true,
	})
	bio?: string;

	@Property({
		length: 50,
		nullable: true,
	})
	website?: string;

	@Property({
		length: 50,
		nullable: true,
	})
	avatar?: string;

	@Property({
		length: 60,
		unique: true,
	})
	email: string;

	@OneToMany(() => Post, post => post.user, { hidden: true })
	posts = new Collection<Post>(this);

	@Property({
		length: 50,
	})
	username: string;

	@Exclude({ toPlainOnly: true })
	@Property()
	password: string;

	@ManyToMany({ hidden: true })
	favorites = new Collection<Post>(this);

	@ManyToMany({
		entity: () => User,
		inversedBy: u => u.followed,
		owner: true,
		pivotTable: 'user_to_follower',
		joinColumn: 'follower',
		inverseJoinColumn: 'following',
		hidden: true,
	})
	followers = new Collection<User>(this);

	@ManyToMany(() => User, u => u.followers, { hidden: true })
	followed = new Collection<User>(this);

	@Property({
		default: 0,
	})
	postCount: number;

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}

	toJSON(user?: User) {
		const o = wrap<User>(this).toObject() as UserDTO;

		o.avatar =
			this.avatar ||
			'https://static.productionready.io/images/smiley-cyrus.jpg';
		o.following =
			user && user.followers.isInitialized()
				? user.followers.contains(this)
				: false; // TODO or followed?

		return o;
	}
}

interface UserDTO extends EntityDTO<User> {
	following?: boolean;
}
