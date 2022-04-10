import { AdminModuleFactory, CustomLoader } from "@adminjs/nestjs";
import { Post, User } from "@entities";
import { AnyEntity, EntityClass, MikroORM } from "@mikro-orm/core";
import AdminJS from "adminjs";
import * as argon from "argon2";

const defaultPropertyList = {
	createdAt: {
		isVisible: {
			show: false,
			edit: false,
		},
	},
	isObsolete: {
		isVisible: {
			show: false,
			edit: false,
		},
		components: {
			show: AdminJS.bundle("./components/NotCreatableInput"),
		},
	},
	isActive: {
		isVisible: {
			show: false,
			edit: false,
		},
		components: {
			show: AdminJS.bundle("./components/NotCreatableInput"),
		},
	},

	deletedAt: {
		isVisible: {
			show: false,
			edit: false,
		},
	},
	updatedAt: {
		isVisible: {
			show: false,
			edit: false,
		},
	},
	idx: {
		isVisible: {
			show: false,
			edit: false,
		},
	},
	id: {
		isVisible: {
			show: false,
			edit: false,
		},
	},
};

export const adminjsConfig: AdminModuleFactory & CustomLoader = {
	inject: [MikroORM],
	useFactory: async (orm: MikroORM) => {
		return {
			adminJsOptions: {
				rootPath: "/admin",
				branding: {
					companyName: "NestJS Admin",
					logo: "https://rb.gy/p8apxe",
				},
				auth: {
					authenticate: async (email: string, password: string) => {
						const user = await orm.em
							.getRepository(User)
							.findOne({ email });

						if (
							user &&
							(await argon.verify(user.password, password))
						) {
							return user;
						}

						return null;
					},
					cookieName: "test",
					cookiePassword: "testPass",
				},
				resources: [
					CreateOrmResource(orm, User, {
						roles: {
							availableValues: ["admin", "user"],
							type: "string",
						},
						password: { type: "password" },
					}),
					CreateOrmResource(orm, Post, {
						tags: { type: "string", isArray: true },
						content: { type: "richtext" },
						excerpt: { type: "richtext" },
					}),
				],
			},
		};
	},
};

export const CreateOrmResource = (
	orm: MikroORM,
	model: EntityClass<AnyEntity>,
	fieldOptions: any = {},
) => {
	return {
		resource: {
			model,
			orm,
		},
		options: {
			properties: {
				...defaultPropertyList,
				...fieldOptions,
			},
		},
	};
};
export const theme = {
	colors: {
		bck: "#20273E",
		defaultText: "#FFFFFF",
		lightText: "#A9AABC",
		border: "#2E324A",
		borderOnDark: "#2E324A",
		innerBck: "#192035",
		darkBck: "#20273E",
		lightBck: "#485899",
		superLightBack: "#303B62",
		inputBck: "#192035",
		lightSuccess: "#008340",
		lightError: "#660040",
	},
};
