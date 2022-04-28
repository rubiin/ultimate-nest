import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { Comment, Post, User } from "@entities";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { forkJoin, from, map, Observable, of, switchMap } from "rxjs";
import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: BaseRepository<Post>,
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		@InjectRepository(User)
		private readonly commentRepository: BaseRepository<Comment>,
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

	addComment(
		userId: number,
		slug: string,
		dto: CreateCommentDto,
	): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail(
				{ slug, isObsolete: false, isActive: true },
				{ populate: ["author"] },
			),
		);
		const user$ = from(this.userRepository.findOneOrFail(userId));
		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				const comment = new Comment(user, post, dto.body);

				return from(
					this.commentRepository.persistAndFlush(comment),
				).pipe(map(() => post));
			}),
		);
	}

	deleteComment(slug: string, id: number) {
		const article$ = from(
			this.postRepository.findOneOrFail(
				{ slug, isObsolete: false, isActive: true },
				{ populate: ["author"] },
			),
		);
		article$.pipe(
			switchMap(article => {
				const comment = this.commentRepository.getReference(id);
				if (article.comments.contains(comment)) {
					article.comments.remove(comment);
					from(this.commentRepository.removeAndFlush(comment)).pipe(
						map(() => article),
					);
				}
				return of(article);
			}),
		);
	}

	getById(index: string, author?: User): Observable<Post> {
		return from(
			this.postRepository.findOne({
				idx: index,
				isObsolete: false,
				isActive: true,
			}),
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

	findComments(slug: string): Observable<Comment[]> {
		return from(
			this.postRepository.findOne(
				{ slug, isObsolete: false, isActive: true },
				{ populate: ["comments"] },
			),
		).pipe(map(article => article.comments.getItems()));
	}

	favorite(id: number, slug: string): Observable<Post> {
		const article$ = from(
			this.postRepository.findOneOrFail(
				{ slug },
				{ populate: ["author"] },
			),
		);
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id, isObsolete: false, isActive: true },
				{
					populate: ["favorites", "followers"],
				},
			),
		);

		return forkJoin([article$, user$]).pipe(
			switchMap(([article, user]) => {
				if (!user.favorites.contains(article)) {
					user.favorites.add(article);
					article.favoritesCount++;
				}
				return from(this.postRepository.flush()).pipe(
					map(() => article),
				);
			}),
		);
	}

	unFavorite(id: number, slug: string): Observable<Post> {
		const article$ = from(
			this.postRepository.findOneOrFail(
				{ slug, isObsolete: false, isActive: true },
				{ populate: ["author"] },
			),
		);
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id, isObsolete: false, isActive: true },
				{
					populate: ["favorites", "followers"],
				},
			),
		);

		return forkJoin([article$, user$]).pipe(
			switchMap(([article, user]) => {
				if (!user.favorites.contains(article)) {
					user.favorites.remove(article);
					article.favoritesCount--;
				}
				return from(this.postRepository.flush()).pipe(
					map(() => article),
				);
			}),
		);
	}
}
