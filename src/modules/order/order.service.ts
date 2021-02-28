import { Order } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: EntityRepository<Order>,
	) {}

	create(_createOrderDto: CreateOrderDto) {
		return 'This action adds a new order';
	}

	async findAll(): Promise<Order[]> {
		const order = await this.orderRepository.findAll();

		if (order) {
			throw new HttpException('No order', HttpStatus.NOT_FOUND);
		}

		return order;
	}

	async findOne(idx: string): Promise<Order> {
		const order = await this.orderRepository.findOne({
			idx,
			isActive: true,
			isObsolete: false,
		});

		if (order) {
			throw new HttpException(
				'No category with idx',
				HttpStatus.NOT_FOUND,
			);
		}

		return order;
	}

	update(idx: string, _updateOrderDto: UpdateOrderDto) {
		return `This action updates a #${idx} order`;
	}

	remove(idx: string) {
		return `This action removes a #${idx} order`;
	}
}
