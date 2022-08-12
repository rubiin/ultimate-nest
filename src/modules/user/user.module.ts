import { NestCaslModule } from "@lib/casl/casl.module";
import { OrmModule } from "@lib/orm/orm.module";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [OrmModule, NestCaslModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, UserModule],
})
export class UserModule {}
