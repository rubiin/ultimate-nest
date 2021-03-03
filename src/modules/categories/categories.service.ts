import { Category } from '@entities';
import { EntityRepository, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
	HttpStatus,
	Injectable,
	HttpException,
	Inject,
	Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryRepository: EntityRepository<Category>,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}

	async create(createCategoryDto: CreateCategoryDto) {
		const category = this.categoryRepository.create(createCategoryDto);

		await this.categoryRepository.persistAndFlush(category);

		return category;
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

	async update(idx: string, updateCategoryDto: UpdateCategoryDto) {
		const category = await this.categoryRepository.findOne({ idx });

		wrap(category).assign(updateCategoryDto);
		await this.categoryRepository.flush();

		return category;
	}

	async remove(idx: string) {
		return this.categoryRepository.remove({ idx });
	}
}
