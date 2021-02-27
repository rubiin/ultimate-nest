import { Product } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: EntityRepository<Product>,
	) {}

	async create(createProductDto: CreateProductDto) {
		const productExists = await this.productRepository.findOne({
			name: createProductDto.name,
			isActive: true,
			isObsolete: false,
		});

		if (productExists) {
			throw new HttpException(
				'Product with name exists',
				HttpStatus.CONFLICT,
			);
		}

		return this.productRepository.persistAndFlush(createProductDto);
	}

	findAll() {
		return `This action returns all products`;
	}

	findOne(id: number) {
		return `This action returns a #${id} product`;
	}

	update(id: number, _updateProductDto: UpdateProductDto) {
		return `This action updates a #${id} product`;
	}

	remove(id: number) {
		return `This action removes a #${id} product`;
	}
}
