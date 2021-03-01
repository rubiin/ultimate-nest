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
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	@Get()
	findAll() {
		return this.productsService.findAll();
	}

	@Get(':idx')
	findOne(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.productsService.findOne(idx);
	}

	@Put(':idx')
	update(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return this.productsService.update(idx, updateProductDto);
	}

	@Delete(':idx')
	remove(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.productsService.remove(idx);
	}
}
