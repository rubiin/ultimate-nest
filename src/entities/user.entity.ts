import {
	BeforeCreate,
	BeforeUpdate,
	Entity,
	Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@common/database/base-entity.entity';
import { Exclude } from 'class-transformer';
import { HelperService } from '@common/helpers/helpers.utils';

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


	@Exclude({ toPlainOnly: true })
	@Property()
	password: string;


	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await HelperService.hashString(this.password);
	}
}
