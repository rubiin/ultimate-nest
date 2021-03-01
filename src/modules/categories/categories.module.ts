import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	controllers: [CategoriesController],
	providers: [CategoriesService],
	imports: [OrmModule],
})
export class CategoriesModule {}
