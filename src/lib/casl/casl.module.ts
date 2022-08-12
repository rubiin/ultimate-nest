import { permissions } from "@common/permissions/user.permissions";
import { Roles } from "@common/types/permission.enum";
import { Global, Module } from "@nestjs/common";
import { CaslModule } from "nest-casl";

@Global()
@Module({
	exports: [CaslModule],
	imports: [
		CaslModule.forRoot<Roles>({
			superuserRole: Roles.ADMIN,
		}),
		CaslModule.forFeature({ permissions }),
	],
})
export class NestCaslModule {}
