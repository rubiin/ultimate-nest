import { Order } from '@entities';
import { EntityRepository, wrap } from '@mikro-orm/core';
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

	async create(createOrderDto: CreateOrderDto) {
		const order = this.orderRepository.create(createOrderDto);

		await this.orderRepository.persistAndFlush(order);

		return order;
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

	async update(idx: string, updateOrderDto: UpdateOrderDto) {
		const order = await this.orderRepository.findOne({ idx });

		wrap(order).assign(updateOrderDto);
		await this.orderRepository.flush();

		return order;
	}

	async remove(idx: string) {
		return this.orderRepository.remove({ idx });
	}
}
