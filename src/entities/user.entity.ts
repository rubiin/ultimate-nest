import {
	ArrayType,
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	OneToMany,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Exclude } from 'class-transformer';
import { HelperService } from '@common/helpers/helpers.utils';
import { EncryptedType } from '@common/database/mikrorm.encrypted';
import { Post } from './post.entity';

@Entity()
export class User extends BaseEntity {
	@Property({
		length: 50,
	})
	firstName: string;

	@Property({
		length: 50,
		nullable: true,
	})
	middleName?: string;

	@Property({
		length: 50,
	})
	lastName: string;

	@Property({
		length: 60,
		unique: true,
	})
	email: string;

	@OneToMany(() => Post, post => post.author, {
		eager: true,
		orphanRemoval: true,
	})
	posts = new Collection<Post>(this);

	@Exclude({ toPlainOnly: true })
	@Property()
	password: string;



	@Property({ type: ArrayType })
	roles: string[];

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}
}
