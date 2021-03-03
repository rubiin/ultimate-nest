import { HelperService } from '@common/helpers/helpers.utils';
import {
	EntityName,
	EventArgs,
	EventSubscriber,
	Subscriber,
} from '@mikro-orm/core';
import { User } from '../../entities/user.entity';

@Subscriber()
export class UserSubscriber implements EventSubscriber<User> {
	getSubscribedEntities(): EntityName<User>[] {
		return [User];
	}

	async beforeCreate(args: EventArgs<User>): Promise<void> {
		args.entity.password = await HelperService.hashString(
			args.entity.password,
		);
	}

	async beforeUpdate(args: EventArgs<User>): Promise<void> {
		args.entity.password = await HelperService.hashString(
			args.entity.password,
		);
	}
}
