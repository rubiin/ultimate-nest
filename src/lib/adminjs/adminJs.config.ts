import { AdminModuleFactory, CustomLoader } from "@adminjs/nestjs";
import { User } from "@entities";
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
					CreateCarResource(orm, User, {
						roles: {
							isVisible: {
								show: false,
								edit: false,
							},
						},
					}),
				],
			},
		};
	},
};

export const CreateCarResource = (
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
