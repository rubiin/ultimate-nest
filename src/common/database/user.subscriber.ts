import { HelperService } from "@common/helpers/helpers.utils";
import { EntityName, EventArgs, EventSubscriber, Subscriber } from "@mikro-orm/core";
import { User } from "@entities";

@Subscriber()
/* It's a class that implements the EventSubscriber interface, and it's responsible for hashing the
password before the user is created or updated */
export class UserSubscriber implements EventSubscriber<User> {
	getSubscribedEntities(): EntityName<User>[] {
		return [User];
	}

	async beforeCreate(arguments_: EventArgs<User>): Promise<void> {
		arguments_.entity.password = await HelperService.hashString(arguments_.entity.password);
	}

	async beforeUpdate(arguments_: EventArgs<User>): Promise<void> {
		arguments_.entity.password = await HelperService.hashString(arguments_.entity.password);
	}
}
