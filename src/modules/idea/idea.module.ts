import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	controllers: [IdeaController],
	providers: [IdeaService],
	imports: [OrmModule],
})
export class IdeaModule {}
