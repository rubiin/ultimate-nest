import { AdminModuleFactory, CustomLoader } from "@adminjs/nestjs";
import { User, Post } from "@entities";
import { MikroORM } from "@mikro-orm/core";

const defaultPropertyList = {
	createdAt: {
		isVisible: {
			show: false,
			edit: false,
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
					authenticate: async (email: any, password: any) => ({
						email,
						password,
					}),
					cookieName: "test",
					cookiePassword: "testPass",
				},
				resources: [
					CreateOrmResource(orm, User, {
						roles: { type: "string", isArray: true },
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
	model: any,
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
