import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	providers: [ProfileService],
	controllers: [ProfileController],
	imports: [OrmModule],
})
export class ProfileModule {}
