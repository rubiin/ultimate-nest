import {
	AbilityBuilder,
	createMongoAbility,
	ExtractSubjectType,
	InferSubjects,
	MongoAbility,
} from "@casl/ability";
import { Action, Roles } from "@common/@types";
import { Comment, Post, Tag, User } from "@entities";
import { Injectable } from "@nestjs/common";

type Subjects = InferSubjects<typeof User | typeof Post | typeof Comment | typeof Tag> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: User) {
		const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

		/* Giving the user the ability to read and write to everything if they are an admin. */

		if (user.roles.includes(Roles.ADMIN)) {
			can(Action.Manage, "all"); // read-write access to everything
		} else {
			can(Action.Read, "all"); // read-only access to everything
		}

		// user specific permissions
		can(Action.Update, User, { id: user.id });
		cannot(Action.Delete, User);

		// post specific permissions
		can([Action.Delete, Action.Update], Post, { author: user });

		// comment specific permissions
		can([Action.Update, Action.Delete], Comment, { author: user });

		return build({
			detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
