import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';

@Module({
	controllers: [IdeaController],
	providers: [IdeaService],
})
export class IdeaModule {}
