import { OrmModule } from '@modules/orm/orm.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [OrmModule],
})
export class AuthModule {}
