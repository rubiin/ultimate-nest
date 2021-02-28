import {
	Controller,
	Get,
	Post,
	Body,
	Put,
	Param,
	Delete,
	ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}

	@Get()
	findAll() {
		return this.categoriesService.findAll();
	}

	@Get(':idx')
	findOne(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.categoriesService.findOne(idx);
	}

	@Put(':idx')
	update(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return this.categoriesService.update(idx, updateCategoryDto);
	}

	@Delete(':idx')
	remove(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.categoriesService.remove(idx);
	}
}
