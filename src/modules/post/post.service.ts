import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { Post, User } from "@entities";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { from, map, Observable, switchMap } from "rxjs";
import { CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: BaseRepository<Post>,
		private readonly i18nService: I18nService,
	) {}

	getMany({
		page,
		order,
		limit,
		offset,
	}: PageOptionsDto): Observable<Pagination<Post>> {
		return from(
			this.postRepository.findAndPaginate(
				{ isObsolete: false },
				{
					limit,
					offset,
					orderBy: { createdAt: order.toLowerCase() },
				},
			),
		).pipe(
			map(({ results, total }) => {
				return createPaginationObject<Post>(
					results,
					total,
					page,
					limit,
				);
			}),
		);
	}

	getById(index: string, author?: User): Observable<Post> {
		return from(
			this.postRepository.findOne({ idx: index, isObsolete: false }),
		).pipe(
			map(p => {
				const post = !author
					? p
					: !!p && author.id === p.author.id
					? p
					: null;

				if (!post) {
					throw new NotFoundException(
						this.i18nService.t("status.POST_DOESNT_EXIST"),
					);
				} else {
					return post;
				}
			}),
		);
	}

	async createOne(dto: CreatePostDto, author: User) {
		const post = this.postRepository.create({ ...dto, author });

		await this.postRepository.persistAndFlush(post);

		return post;
	}

	editOne(index: string, dto: EditPostDto, author?: User): Observable<Post> {
		return this.getById(index, author).pipe(
			switchMap(post => {
				wrap(post).assign(dto);

				return from(this.postRepository.flush()).pipe(map(() => post));
			}),
		);
	}

	deleteOne(index: string, author?: User): Observable<Post> {
		return this.getById(index, author).pipe(
			switchMap(post => {
				return from(this.postRepository.softRemoveAndFlush(post)).pipe(
					map(() => post),
				);
			}),
		);
	}
}
