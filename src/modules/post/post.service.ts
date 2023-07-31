import { CursorType, PaginationResponse, QueryOrder } from "@common/@types";
import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { Category, Comment, Post, Tag, User } from "@entities";
import { translate } from "@lib/i18n";
import { AutoPath } from "@mikro-orm/core/typings";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { omit } from "helper-fns";
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
	 * @param dto
	 */
	findAll(dto: CursorPaginationDto): Observable<PaginationResponse<Post>> {
		const qb = this.postRepository.createQueryBuilder(this.queryName);

		return from(
			this.postRepository.qbCursorPagination({
				qb,
				pageOptionsDto: {
					alias: this.queryName,
					cursor: "title",
					cursorType: CursorType.STRING,
					order: QueryOrder.ASC,
					searchField: "title",
					...dto,
				},
			}),
		);
	}

	/* Finding a post by slug, and then returning the comments of that post */
	findOne(slug: string, populate: AutoPath<Post, keyof Post>[] = []): Observable<Post> {
		return from(
			this.postRepository.findOne(
				{
					slug,
				},
				{ populate },
			),
		).pipe(
			mergeMap(post => {
				if (!post) {
					return throwError(
						() =>
							new NotFoundException(
								translate(
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
	 * It gets a post by its slug, assigns the new values to it, and then flushes the changes to the
	 * database
	 * @param {string} slug - string - the slug of the post to edit
	 * @param {EditPostDto} dto - EditPostDto
	 * @returns Observable<Post>
	 */
	update(slug: string, dto: EditPostDto): Observable<Post> {
		return this.findOne(slug).pipe(
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
	 * "Get the post by slug, then delete it and return the deleted post."
	 *
	 * @param {string} slug - string - The slug of the post to delete.
	 * @returns Observable<Post>
	 */
	remove(slug: string): Observable<Post> {
		return this.findOne(slug).pipe(
			switchMap(post => {
				return this.postRepository.softRemoveAndFlush(post).pipe(map(() => post));
			}),
		);
	}

	/**
	 * "Find the post and user, add the post to the user's favorites, and increment the post's favorites
	 * count."
	 *
	 * @param {number} userId - number - The id of the user who favorite the post.
	 * @param {string} slug - The slug of the post to be favorited.
	 * @returns A post object
	 */
	favorite(userId: number, slug: string): Observable<Post> {
		const post$ = from(this.postRepository.findOneOrFail({ idx: slug }));
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
	 * @param {string} slug - The slug of the post to be favorited.
	 * @returns A post object
	 */
	unFavorite(userId: number, slug: string): Observable<Post> {
		const post$ = from(
			this.postRepository.findOneOrFail({
				idx: slug,
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
	 * It finds a post by slug, and then returns the comments of that post
	 * @param {string} slug - string - The slug of the post to find comments for.
	 * @returns An array of comments
	 */
	findComments(slug: string): Observable<Comment[]> {
		return from(
			this.postRepository.findOne(
				{ slug },
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
	 * It takes a userId, a post slug, and a DTO, and returns an observable of a post
	 * @param {number} userId - number,
	 * @param {string} slug - string - the slug of the post to add the comment to
	 * @param {CreateCommentDto} dto - CreateCommentDto
	 * @returns Post
	 */
	addComment(userId: number, slug: string, dto: CreateCommentDto): Observable<Post> {
		const post$ = this.findOne(slug);
		const user$ = from(this.userRepository.findOneOrFail(userId));

		return forkJoin([post$, user$]).pipe(
			switchMap(([post, user]) => {
				const comment = new Comment({ body: dto.body, author: user });

				post.comments.add(comment);

				return from(this.em.flush()).pipe(map(() => post));
			}),
		);
	}

	/**
	 * This function edits a comment on a post using data from a DTO and returns the updated post.
	 * @param {string} slug - A string representing the slug of the post to which the comment belongs.
	 * @param {string} commentIndex - commentIndex is a string parameter that represents the unique
	 * @param {CreateCommentDto} commentData - commentData is an object of type CreateCommentDto
	 * @returns The `editComment` method is returning an Observable that emits the updated post data after
	 * editing the comment specified by `commentIndex` in the post specified by `slug`.
	 */
	editComment(slug: string, commentIndex: string, commentData: CreateCommentDto) {
		return this.findOne(slug, ["comments"]).pipe(
			switchMap(_post => {
				return from(this.commentRepository.findOneOrFail({ idx: commentIndex })).pipe(
					switchMap(comment => {
						this.commentRepository.assign(comment, commentData);

						return from(this.em.flush()).pipe(map(() => _post));
					}),
				);
			}),
		);
	}

	/**
	 * It finds a post and a comment, removes the comment from the post, and then deletes the comment
	 * @param {string} slug - string - The id of the post
	 * @param {string} commentIndex - The id of the comment to be deleted
	 * @returns A post with the comment removed.
	 */
	deleteComment(slug: string, commentIndex: string): Observable<Post> {
		return forkJoin([
			this.findOne(slug),
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
