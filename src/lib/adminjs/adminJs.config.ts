import { AdminModuleFactory, CustomLoader } from "@adminjs/nestjs";
import { User } from "@entities";
import { MikroORM } from "@mikro-orm/core";

export const adminjsConfig: AdminModuleFactory & CustomLoader = {
	inject: [MikroORM],
	useFactory: async (orm: MikroORM) => {
		return {
			adminJsOptions: {
				rootPath: "/admin",
				branding: {
					companyName: "NestJS Admin",
				},
				auth: {
					authenticate: async (email, password) => ({
						email,
						password,
					}),
					cookieName: "test",
					cookiePassword: "testPass",
				},
				resources: [
					{
						model: User,
						orm,
					},
				],
			},
		};
	},
};
