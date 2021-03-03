import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	controllers: [OrderController],
	providers: [OrderService],
	imports: [OrmModule],
})
export class OrderModule {}
