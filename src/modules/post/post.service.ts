import { Post, User } from "@entities";
import { wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";

import { CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: EntityRepository<Post>,
	) {}

	async getMany() {
		return await this.postRepository.find({});
	}

	async getById(id: number, author?: User) {
		const post = await this.postRepository
			.findOne(id)
			.then(p =>
				!author ? p : !!p && author.id === p.author.id ? p : null,
			);

		if (!post)
			throw new NotFoundException("Post does not exist or unauthorized");

		return post;
	}

	async createOne(dto: CreatePostDto, author: User) {
		const post = this.postRepository.create({ ...dto, author });

		await this.postRepository.persistAndFlush(post);

		return post;
	}

	async editOne(id: number, dto: EditPostDto, author?: User) {
		const post = await this.getById(id, author);

		wrap(post).assign(dto);
		await this.postRepository.flush();

		return post;
	}

	async deleteOne(id: number, author?: User) {
		const post = await this.getById(id, author);

		await this.postRepository.remove(post);

		return post;
	}
}
