import {
	Controller,
	Get,
	Post,
	Body,
	Put,
	Param,
	Delete,
	ParseUUIDPipe,
	UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { User } from '@entities';

@Controller('order')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() createOrderDto: CreateOrderDto, @LoggedInUser() user: User) {
		return this.orderService.create(createOrderDto, user);
	}

	@Get()
	findAll() {
		return this.orderService.findAll();
	}

	@Get(':idx')
	findOne(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.orderService.findOne(idx);
	}

	@Put(':idx')
	update(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() updateOrderDto: UpdateOrderDto,
	) {
		return this.orderService.update(idx, updateOrderDto);
	}

	@Delete(':idx')
	remove(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.orderService.remove(idx);
	}
}
