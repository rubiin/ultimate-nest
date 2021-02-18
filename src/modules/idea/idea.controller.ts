import { UpdateIdeaDto } from './dtos/update-idea.dto';
import {
	Controller,
	Get,
	Post,
	Body,
	Put,
	Param,
	Delete,
	ParseIntPipe,
} from '@nestjs/common';
import { CreateIdeaDto } from './dtos/create-idea.dto';
import { IdeaService } from './idea.service';

@Controller('idea')
export class IdeaController {
	constructor(private readonly ideaService: IdeaService) {}

	@Post()
	create(@Body() createIdeaDto: CreateIdeaDto) {
		return this.ideaService.create(createIdeaDto);
	}

	@Get()
	findAll() {
		return this.ideaService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.ideaService.findOne(id);
	}

	@Put(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateIdeaDto: UpdateIdeaDto,
	) {
		return this.ideaService.update(id, updateIdeaDto);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.ideaService.remove(id);
	}
}
