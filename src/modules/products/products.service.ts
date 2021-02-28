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

	async create(createProductDto: CreateProductDto): Promise<Product> {
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

		const product = this.productRepository.create(createProductDto);

		await this.productRepository.persistAndFlush(product);

		return product;
	}

	async findAll(): Promise<Product[]> {
		const product = await this.productRepository.findAll();

		if (product) {
			throw new HttpException('No products', HttpStatus.NOT_FOUND);
		}

		return product;
	}

	async findOne(idx: string): Promise<Product> {
		const category = await this.productRepository.findOne({
			idx,
			isActive: true,
			isObsolete: false,
		});

		if (category) {
			throw new HttpException(
				'No product with idx',
				HttpStatus.NOT_FOUND,
			);
		}

		return category;
	}

	update(id: number, _updateProductDto: UpdateProductDto) {
		return `This action updates a #${id} product`;
	}

	remove(id: number) {
		return `This action removes a #${id} product`;
	}
}
