import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
	controllers: [CategoriesController],
	providers: [CategoriesService],
})
export class CategoriesModule {}
