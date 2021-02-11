import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@lib/config/config.module';
import { WinstonModule } from '@lib/winston/winston.module';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	imports: [AuthModule, UserModule, WinstonModule, ConfigModule, OrmModule],
})
export class AppModule {}
