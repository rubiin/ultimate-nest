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
		index: string,
		dto: CreateCommentDto,
	): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail(
				{ idx: index, isObsolete: false, isActive: true },
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

	deleteComment(index: string) {
		const post$ = from(
			this.postRepository.findOneOrFail(
				{ idx: index, isObsolete: false, isActive: true },
				{ populate: ["author"] },
			),
		);

		post$.pipe(
			switchMap(post => {
				const comment = this.commentRepository.getReference(post.id);

				if (post.comments.contains(comment)) {
					post.comments.remove(comment);
					from(this.commentRepository.removeAndFlush(comment)).pipe(
						map(() => post),
					);
				}

				return of(post);
			}),
		);
	}

	getById(index: string, author?: User): Observable<Post> {
		return from(
			this.postRepository.findOne(
				{
					idx: index,
					isObsolete: false,
					isActive: true,
				},
				{ populate: ["author", "comments"] },
			),
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

	findComments(index: string): Observable<Comment[]> {
		return from(
			this.postRepository.findOne(
				{ idx: index, isObsolete: false, isActive: true },
				{ populate: ["comments"] },
			),
		).pipe(map(post => post.comments.getItems()));
	}

	favorite(userId: number, postIndex: string): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail(
				{ idx: postIndex },
				{ populate: ["author"] },
			),
		);
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id: userId, isObsolete: false, isActive: true },
				{
					populate: ["favorites", "followers"],
				},
			),
		);

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				if (!user.favorites.contains(post)) {
					user.favorites.add(post);
					post.favoritesCount++;
				}

				return from(this.postRepository.flush()).pipe(map(() => post));
			}),
		);
	}

	unFavorite(userId: number, postIndex: string): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail(
				{ idx: postIndex, isObsolete: false, isActive: true },
				{ populate: ["author"] },
			),
		);
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id: userId, isObsolete: false, isActive: true },
				{
					populate: ["favorites", "followers"],
				},
			),
		);

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				if (!user.favorites.contains(post)) {
					user.favorites.remove(post);
					post.favoritesCount--;
				}

				return from(this.postRepository.flush()).pipe(map(() => post));
			}),
		);
	}
}
