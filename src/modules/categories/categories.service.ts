import { Category } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryRepository: EntityRepository<Category>,
	) {}

	create(_createCategoryDto: CreateCategoryDto) {
		return 'This action adds a new category';
	}

	async findAll(): Promise<Category[]> {
		const category = await this.categoryRepository.findAll();

		if (category) {
			throw new HttpException('No category', HttpStatus.NOT_FOUND);
		}

		return category;
	}

	async findOne(idx: string): Promise<Category> {
		const category = await this.categoryRepository.findOne({
			idx,
			isActive: true,
			isObsolete: false,
		});

		if (category) {
			throw new HttpException(
				'No category with idx',
				HttpStatus.NOT_FOUND,
			);
		}

		return category;
	}

	async update(idx: string, _updateCategoryDto: UpdateCategoryDto) {
		return `This action updates a #${idx} category`;
	}

	async remove(idx: string) {
		return `This action removes a #${idx} category`;
	}
}
