import { OrmModule } from '@modules/orm/orm.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';

@Module({
	imports: [OrmModule, AuthModule],
})
export class AppModule {}
