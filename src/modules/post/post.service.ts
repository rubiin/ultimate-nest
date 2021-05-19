import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@entities';
import { User } from '@entities';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: EntityRepository<Post>,
	) {}

	async getMany() {
		return await this.postRepository.findAll();
	}

	async getById(id: number, author?: User) {
		const post = await this.postRepository
			.findOne(id)
			.then(p =>
				!author ? p : !!p && author.id === p.author.id ? p : null,
			);
		if (!post)
			throw new NotFoundException('Post does not exist or unauthorized');
		return post;
	}

	async createOne(dto: CreatePostDto, author: User) {
		const post = this.postRepository.create({ ...dto, author });
		return await this.postRepository.persistAndFlush(post);
	}

	async editOne(id: number, dto: EditPostDto, author?: User) {
		const post = await this.getById(id, author);
		const editedPost = Object.assign(post, dto);
		return await this.postRepository.persistAndFlush(editedPost);
	}

	async deleteOne(id: number, author?: User) {
		const post = await this.getById(id, author);
		return await this.postRepository.remove(post);
	}
}
