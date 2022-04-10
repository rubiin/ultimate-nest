import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { Post, User } from "@entities";
import { createPaginationObject } from "@lib/pagination";
import { wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: BaseRepository<Post>,
	) {}

	async getMany({ page, order, limit, offset }: PageOptionsDto) {
		const { results, total } = await this.postRepository.findAndPaginate(
			{},
			{
				limit,
				offset,
				orderBy: { createdAt: order.toLowerCase() },
			},
		);

		return createPaginationObject<Post>(results, total, page, limit);
	}

	async getById(idx: string, author?: User) {
		const post = await this.postRepository
			.findOne({ idx })
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

	async editOne(idx: string, dto: EditPostDto, author?: User) {
		const post = await this.getById(idx, author);

		wrap(post).assign(dto);
		await this.postRepository.flush();

		return post;
	}

	async deleteOne(idx: string, author?: User) {
		const post = await this.getById(idx, author);

		await this.postRepository.remove(post);

		return post;
	}
}
