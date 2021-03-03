import { Order, OrderItem, Product, User } from '@entities';
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
		@InjectRepository(OrderItem)
		private readonly orderItemRepository: EntityRepository<OrderItem>,
		@InjectRepository(Product)
		private readonly productRepository: EntityRepository<Product>,
	) {}

	async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
		let totalPrice = 0;

		const orderItems = Promise.all(
			createOrderDto.orderItems.map(async orderItem => {
				const product = await this.productRepository.findOne({
					idx: orderItem.idx,
					isActive: true,
					isObsolete: false,
				});

				const newOrderItem = new OrderItem(orderItem.quantity, product);

				await this.orderItemRepository.persistAndFlush(newOrderItem);

				totalPrice += product.price * orderItem.quantity;

				return newOrderItem.id;
			}),
		);

		const orderItemsIdsResolved = await orderItems;

		const order = new Order({
			orderItems: orderItemsIdsResolved,
			shippingAddress1: createOrderDto.shippingAddress1,
			shippingAddress2: createOrderDto.shippingAddress2,
			city: createOrderDto.city,
			zip: createOrderDto.zip,
			country: createOrderDto.country,
			phone: createOrderDto.phone,
			totalPrice: totalPrice,
			user: user,
		});

		await this.orderRepository.persistAndFlush(Order);

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
