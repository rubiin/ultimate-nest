import { User } from "@entities";
import { EntityName, EventArgs, EventSubscriber, Subscriber } from "@mikro-orm/core";
import { hash } from "argon2";

@Subscriber()
/* It's a class that implements the EventSubscriber interface, and it's responsible for hashing the
password before the user is created or updated */
export class UserSubscriber implements EventSubscriber<User> {
	getSubscribedEntities(): EntityName<User>[] {
		return [User];
	}

	async beforeCreate(arguments_: EventArgs<User>): Promise<void> {
		arguments_.entity.password = await hash(arguments_.entity.password);
	}

	async beforeUpdate(arguments_: EventArgs<User>): Promise<void> {
		arguments_.entity.password = await hash(arguments_.entity.password);
	}
}
