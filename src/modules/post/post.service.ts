import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { Post, User } from "@entities";
import { createPaginationObject } from "@lib/pagination";
import { wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: BaseRepository<Post>,
		private readonly i18nService: I18nService,
	) {}

	async getMany({ page, order, limit, offset }: PageOptionsDto) {
		const { results, total } = await this.postRepository.findAndPaginate(
			{ isObsolete: false },
			{
				limit,
				offset,
				orderBy: { createdAt: order.toLowerCase() },
			},
		);

		return createPaginationObject<Post>(results, total, page, limit);
	}

	async getById(index: string, author?: User) {
		const post = await this.postRepository
			.findOne({ idx: index })
			.then(p =>
				!author ? p : !!p && author.id === p.author.id ? p : null,
			);

		if (!post)
			throw new NotFoundException(
				this.i18nService.t("status.POST_EMAIL_EXISTS"),
			);

		return post;
	}

	async createOne(dto: CreatePostDto, author: User) {
		const post = this.postRepository.create({ ...dto, author });

		await this.postRepository.persistAndFlush(post);

		return post;
	}

	async editOne(index: string, dto: EditPostDto, author?: User) {
		const post = await this.getById(index, author);

		wrap(post).assign(dto);
		await this.postRepository.flush();

		return post;
	}

	async deleteOne(index: string, author?: User) {
		const post = await this.getById(index, author);

		await this.postRepository.softRemoveAndFlush(post);

		return post;
	}
}
