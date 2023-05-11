import { CursorTypeEnum, QueryOrderEnum } from "@common/@types";
import { PaginationClass } from "@common/@types/pagination.class";
import { isNull, isUndefined } from "@common/@types/types";
import { BaseRepository } from "@common/database";
import { SearchDto } from "@common/dtos/search.dto";
import { HelperService } from "@common/helpers";
import { Category, Comment, Post, Tag, User } from "@entities";
import { AutoPath } from "@mikro-orm/core/typings";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { omit } from "helper-fns";
import { I18nContext } from "nestjs-i18n";
import { forkJoin, from, map, mergeMap, Observable, of, switchMap, throwError, zip } from "rxjs";

import { CreateCommentDto, CreatePostDto, EditPostDto } from "./dtos";

@Injectable()
export class PostService {
	private readonly queryName = "p";

	constructor(
		private readonly em: EntityManager,
		@InjectRepository(Post)
		private readonly postRepository: BaseRepository<Post>,
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		@InjectRepository(Comment)
		private readonly commentRepository: BaseRepository<Comment>,
		@InjectRepository(Tag)
		private readonly tagRepository: BaseRepository<Tag>,
		@InjectRepository(Category)
		private readonly categoryRepository: BaseRepository<Category>,
	) {}

	/**
	 * It returns an observable of a pagination object, which is created from the results of a query to the
	 * database
	 * offset.
	 * @returns An observable of a pagination object.
	 * @param SearchDto - The search dto.
	 */
	findAll(dto: SearchDto): Observable<PaginationClass<Post>> {
		const { search, first, after, withDeleted } = dto;
		const qb = this.postRepository.createQueryBuilder(this.queryName).where({
			isDeleted: withDeleted,
		});

		if (!isUndefined(search) && !isNull(search)) {
			qb.andWhere({
				title: {
					$ilike: HelperService.formatSearch(search),
				},
			});
		}

		return from(
			this.postRepository.queryBuilderPagination({
				alias: this.queryName,
				cursor: "title",
				cursorType: CursorTypeEnum.STRING,
				first,
				order: QueryOrderEnum.ASC,
				qb,
				after,
				search,
			}),
		);
	}

	/* Finding a post by id, and then returning the comments of that post */
	findOne(index: string, populate: AutoPath<Post, keyof Post>[] = []): Observable<Post> {
		return from(
			this.postRepository.findOne(
				{
					idx: index,
				},
				{ populate },
			),
		).pipe(
			mergeMap(post => {
				if (!post) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: "Post" },
									},
								),
							),
					);
				}

				return of(post);
			}),
		);
	}

	/**
	 * It creates a new post, saves it to the database, and returns it
	 * @param {CreatePostDto} dto - CreatePostDto - this is the DTO that we created earlier.
	 * @param {User} author - User - this is the user that is currently logged in.
	 * @returns The post object
	 */
	create(dto: CreatePostDto, author: User): Observable<Post> {
		return zip(
			this.tagRepository.find({
				idx: dto.tags,
			}),
			this.categoryRepository.find({
				idx: dto.categories,
			}),
		).pipe(
			switchMap(([tags, categories]) => {
				const post = this.postRepository.create({
					...omit(dto, ["tags", "categories"]),
					author,
					categories,
					tags,
				});

				return from(this.em.persistAndFlush(post)).pipe(map(() => post));
			}),
		);
	}

	/**
	 * It gets a post by its index, assigns the new values to it, and then flushes the changes to the
	 * database
	 * @param {string} index - string - the index of the post to edit
	 * @param {EditPostDto} dto - EditPostDto
	 * @returns Observable<Post>
	 */
	update(index: string, dto: EditPostDto): Observable<Post> {
		return this.findOne(index).pipe(
			switchMap(post => {
				if (dto.tags) {
					return from(
						this.tagRepository.find({
							idx: dto.tags,
						}),
					).pipe(
						switchMap(tags => {
							this.postRepository.assign(post, {
								...omit(dto, ["tags", "categories"]),
								tags,
							});

							return from(this.em.flush()).pipe(map(() => post));
						}),
					);
				}
				this.postRepository.assign(post, omit(dto, ["tags", "categories"]));

				return from(this.em.flush()).pipe(map(() => post));
			}),
		);
	}

	/**
	 * "Get the post by id, then delete it and return the deleted post."
	 *
	 * The first thing we do is get the post by id. We do this by calling the `getById` function we just
	 * created
	 * @param {string} index - string - The index of the post to delete.
	 * @returns Observable<Post>
	 */
	remove(index: string): Observable<Post> {
		return this.findOne(index).pipe(
			switchMap(post => {
				return this.postRepository.softRemoveAndFlush(post).pipe(map(() => post));
			}),
		);
	}

	/**
	 * "Find the post and user, add the post to the user's favorites, and increment the post's favorites
	 * count."
	 *
	 * The first thing we do is create two observables, one for the post and one for the user. We use the
	 * `findOneOrFail` method to find the post and user. The `findOneOrFail` method will throw an error if
	 * the post or user is not found
	 * @param {number} userId - number - The id of the user who favorite the post.
	 * @param {string} postIndex - The index of the post to be favorited.
	 * @returns A post object
	 */
	favorite(userId: number, postIndex: string): Observable<Post> {
		const post$ = from(this.postRepository.findOneOrFail({ idx: postIndex }));
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id: userId },
				{
					populate: ["favorites"],
					populateWhere: {
						favorites: { isActive: true, isDeleted: false },
					},
				},
			),
		);

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				if (!user.favorites.contains(post)) {
					user.favorites.add(post);
					post.favoritesCount += 1;
				}

				return from(this.em.flush()).pipe(map(() => post));
			}),
		);
	}

	/**
	 * It finds a post and a user, checks if the user has favorited the post, if so, it removes the post
	 * from the user's favorites and decrements the post's favorites count, then it saves the changes to
	 * the database and returns the post
	 * @param {number} userId - number - The id of the user who favorite the post.
	 * @param {string} postIndex - The index of the post to be favorited.
	 * @returns A post object
	 */
	unFavorite(userId: number, postIndex: string): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail({
				idx: postIndex,
			}),
		);
		const user$ = from(
			this.userRepository.findOneOrFail(
				{ id: userId },
				{
					populate: ["favorites"],
					populateWhere: {
						favorites: { isActive: true, isDeleted: false },
					},
				},
			),
		);

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				if (!user.favorites.contains(post)) {
					user.favorites.remove(post);
					post.favoritesCount -= 1;
				}

				return from(this.em.flush()).pipe(map(() => post));
			}),
		);
	}

	/**
	 * It finds a post by index, and then returns the comments of that post
	 * @param {string} index - string - The index of the post to find comments for.
	 * @returns An array of comments
	 */
	findComments(index: string): Observable<Comment[]> {
		return from(
			this.postRepository.findOne(
				{ idx: index },
				{
					populate: ["comments"],
					populateWhere: {
						comments: { isActive: true, isDeleted: false },
					},
				},
			),
		).pipe(map(post => post.comments.getItems()));
	}

	/**
	 * It takes a userId, a post index, and a DTO, and returns an observable of a post
	 * @param {number} userId - number,
	 * @param {string} index - string - the index of the post to add the comment to
	 * @param {CreateCommentDto} dto - CreateCommentDto
	 * @returns Post
	 */
	addComment(userId: number, index: string, dto: CreateCommentDto): Observable<Post> {
		const post$ = this.findOne(index);
		const user$ = from(this.userRepository.findOneOrFail(userId));

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				const comment = new Comment({ body: dto.body, author: user, post });

				return from(this.em.persistAndFlush(comment)).pipe(map(() => post));
			}),
		);
	}

	/**
	 * It finds a post and a comment, removes the comment from the post, and then deletes the comment
	 * @param {string} postIndex - string - The id of the post
	 * @param {string} commentIndex - The id of the comment to be deleted
	 * @returns A post with the comment removed.
	 */
	deleteComment(postIndex: string, commentIndex: string): Observable<Post> {
		return forkJoin([
			this.findOne(postIndex),
			from(this.commentRepository.findOneOrFail({ idx: commentIndex })),
		]).pipe(
			switchMap(([post, comment]) => {
				const commentReference = this.commentRepository.getReference(comment.id);

				if (post.comments.contains(commentReference)) {
					post.comments.remove(commentReference);
					from(this.em.removeAndFlush(commentReference)).pipe(map(() => post));
				}

				return of(post);
			}),
		);
	}
}
