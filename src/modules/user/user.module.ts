import {OrmModule} from "@lib/orm/orm.module";
import {Module} from "@nestjs/common";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";

@Module({
    imports: [OrmModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, UserModule],
})
export class UserModule {
}
