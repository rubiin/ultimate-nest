import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	imports: [OrmModule],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
