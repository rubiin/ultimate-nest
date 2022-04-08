import { AdminModuleFactory, CustomLoader } from "@adminjs/nestjs";
import { User } from "@entities";
import { MikroORM } from "@mikro-orm/core";

export const adminjsConfig: AdminModuleFactory & CustomLoader = {
	inject: [MikroORM],
	useFactory: async (orm: MikroORM) => {
		return {
			adminJsOptions: {
				rootPath: "/admin",
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
