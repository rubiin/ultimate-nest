import { Permissions, Actions } from "nest-casl";
import { InferSubjects } from "@casl/ability";
import { Roles } from "@common/types/permission.enum";
import { Comment, Post, User } from "@entities";

export type Subjects = InferSubjects<
	typeof User | typeof Post | typeof Comment
>;

export const permissions: Permissions<Roles, Subjects, Actions> = {
	everyone({ can }) {
		can(Actions.read, User);
		can(Actions.read, Post);
		can(Actions.read, Comment);
	},

	ADMIN({ can }) {
		can(Actions.manage, "all");
	},

	SUPERADMIN({ extend }) {
		extend(Roles.ADMIN);
	},

	AUTHOR({ user, can, cannot }) {
		can(Actions.update, User, { id: user.id });
		can(Actions.delete, Post, { author: user });
		cannot(Actions.delete, User).because("Author cannot delete users");
	},
};
