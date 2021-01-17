import { OrmModule } from '@modules/orm/orm.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [OrmModule],
})
export class AppModule {}
