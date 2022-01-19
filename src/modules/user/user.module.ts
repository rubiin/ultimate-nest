import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	controllers: [UserController],
	providers: [UserService],
	imports: [OrmModule],
	exports: [UserService],
})
export class UserModule {}
