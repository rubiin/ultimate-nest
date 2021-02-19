import { UpdateIdeaDto } from '@modules/idea/dtos/update-idea.dto';
import { Idea } from '@entities';
import { EntityRepository, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dtos/create-idea.dto';

@Injectable()
export class IdeaService {
	constructor(
		@InjectRepository(Idea)
		private readonly ideasRepository: EntityRepository<Idea>,
	) {}

	async create(createIdeaDto: CreateIdeaDto) {
		const idea = await this.ideasRepository.create(createIdeaDto);

		await this.ideasRepository.persistAndFlush(idea);

		return idea;
	}

	findAll() {
		return `This action returns all idea`;
	}

	async findOne(id: number) {
		return this.ideasRepository.findOne({
			id,
		});
	}

	async update(id: number, updateIdeaDto: Partial<UpdateIdeaDto>) {
		const idea = await this.ideasRepository.findOne(id);

		wrap(idea).assign(updateIdeaDto);
		await this.ideasRepository.flush();

		return idea;
	}

	async remove(id: number) {
		await this.ideasRepository.remove({ id });

		return { deleted: true };
	}
}
