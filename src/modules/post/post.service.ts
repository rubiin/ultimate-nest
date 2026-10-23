import { OffsetMeta, OffsetPaginationResponse, PaginationResponse } from "@common/@types";
import { PostStateEnum, QueryOrder } from "@common/@types";
import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { Category, Comment, Post, Tag, User } from "@entities";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { AutoPath, EntityKey } from "@mikro-orm/core";
import { EntityManager, raw } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { omit } from "helper-fns";
import { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, throwError, zip } from "rxjs";

import { CommentService } from "./comment.service";
import { CreateCommentDto, CreatePostDto, EditPostDto, SearchPostsDto } from "./dtos";
import { FavoriteService } from "./favorite.service";
import { PostPublisherService } from "./post-publisher.service";

@Injectable()
export class PostService {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: BaseRepository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: BaseRepository<Category>,
    private readonly favoriteService: FavoriteService,
    private readonly commentService: CommentService,
    private readonly publisherService: PostPublisherService,
  ) {}

  /**
   * It returns an observable of a pagination object, which is created from the results of a query to the
   * database
   * offset.
   * @param dto - this is the DTO that we created earlier.
   * @returns An observable of a pagination object.
   */
  findAll(dto: CursorPaginationDto): Observable<PaginationResponse<Post>> {
    return from(
      this.postRepository.cursorPagination({
        cursor: "title",
        order: QueryOrder.ASC,
        searchField: "title",
        ...dto,
      }),
    );
  }

  /**
   * Full-text search over published posts, ranked by relevance, optionally narrowed by tag,
   * category and author.
   * @param dto - search words, filters and offset pagination options.
   * @returns An observable of one page of matching posts.
   */
  search(dto: SearchPostsDto): Observable<OffsetPaginationResponse<Post>> {
    const { author, category, tag } = dto;
    const query = raw(`websearch_to_tsquery('english', ?)`, [dto.search]);

    return from(
      this.postRepository.findAndCount(
        {
          published: true,
          // Parenthesised because the ORM appends `= true` to a raw key.
          [raw(`(search_vector @@ ?)`, [query])]: true,
          ...(author && { author: { idx: author } }),
          ...(category && { categories: { idx: category } }),
          ...(tag && { tags: { idx: tag } }),
        },
        {
          limit: dto.limit,
          offset: dto.offset,
          // Raw and field keys can't share one object, and `id` keeps the page order stable.
          orderBy: [
            { [raw(`ts_rank(search_vector, ?)`, [query])]: QueryOrder.DESC },
            { id: QueryOrder.ASC },
          ],
        },
      ),
    ).pipe(
      map(
        ([posts, itemCount]) =>
          new OffsetPaginationResponse(posts, new OffsetMeta({ itemCount, pageOptionsDto: dto })),
      ),
    );
  }

  /* Finding a post by slug, and then returning the comments of that post */
  findOne(slug: string, populate: AutoPath<Post, EntityKey<Post>>[] = []): Observable<Post> {
    return from(
      this.postRepository.findOne(
        {
          slug,
        },
        { populate },
      ),
    ).pipe(
      mergeMap((post) => {
        if (!post) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Post" },
                }),
              ),
          );
        }

        return of(post);
      }),
    );
  }

  /**
   * It creates a new post, saves it to the database, and returns it
   * @param dto - CreatePostDto - this is the DTO that we created earlier.
   * @param author - User - this is the user that is currently logged in.
   * @returns The post object
   */
  create(dto: CreatePostDto, author: User): Observable<Post> {
    this.assertSchedule(dto);

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
          published: dto.published ?? false,
          tags,
        });

        return from(this.em.persist(post).flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * A `SCHEDULED` post only goes live through the cron, which needs a `publishAt` still in the
   * future, so the pair is rejected here rather than left as a post that never publishes. A
   * request that mentions neither field is not policed: an untouched post may already carry a
   * moment the cron has consumed.
   * @param dto - The submitted fields.
   * @param post - The stored post, on an edit; absent on a create.
   * @throws BadRequestException when the state and `publishAt` cannot become a publishable post.
   */
  private assertSchedule(dto: CreatePostDto | EditPostDto, post?: Post): void {
    if (dto.state === undefined && dto.publishAt === undefined) return;
    if ((dto.state ?? post?.state) !== PostStateEnum.SCHEDULED) return;

    const publishAt = dto.publishAt ?? post?.publishAt;

    if (!publishAt) throw new BadRequestException(translate("exception.publishAtRequired"));
    if (new Date(publishAt).getTime() <= Date.now())
      throw new BadRequestException(translate("exception.publishAtInPast"));
  }

  /**
   * It gets a post by its slug, assigns the new values to it, and then flushes the changes to the
   * database
   * @param slug - string - the slug of the post to edit
   * @param dto - EditPostDto
   * @returns Observable<Post>
   */
  update(slug: string, dto: EditPostDto): Observable<Post> {
    return this.findOne(slug).pipe(
      switchMap((post) => {
        this.assertSchedule(dto, post);

        if (dto.tags) {
          return from(
            this.tagRepository.find({
              idx: dto.tags,
            }),
          ).pipe(
            switchMap((tags) => {
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
   * Exposes the publishing sweep for callers that already own a request/transaction context.
   * The `@Cron` entrypoint itself lives in `PostPublisherService`.
   */
  publishScheduledPosts(): Promise<void> {
    return this.publisherService.publishScheduledPosts();
  }

  /**
   * "Get the post by slug, then delete it and return the deleted post."
   * @param slug - string - The slug of the post to delete.
   * @returns Observable<Post>
   */
  remove(slug: string): Observable<Post> {
    return this.findOne(slug).pipe(
      switchMap((post) => {
        return this.postRepository.softRemoveAndFlush(post).pipe(map(() => post));
      }),
    );
  }

  /** Adds the post to the user's favourites, keeping the counter in sync. */
  favorite(userId: number, slug: string): Observable<Post> {
    return this.favoriteService.favorite(userId, slug);
  }

  /** Removes the post from the user's favourites, keeping the counter in sync. */
  unFavorite(userId: number, slug: string): Observable<Post> {
    return this.favoriteService.unFavorite(userId, slug);
  }

  /** Returns the post's active comments. */
  findComments(slug: string): Observable<Comment[]> {
    return this.commentService.findComments(slug);
  }

  /** Adds a comment authored by the user to the post. */
  addComment(userId: number, slug: string, dto: CreateCommentDto): Observable<Post> {
    return this.commentService.addComment(userId, slug, dto);
  }

  /** Updates a comment belonging to the post. */
  editComment(slug: string, commentIndex: string, commentData: CreateCommentDto): Observable<Post> {
    return this.commentService.editComment(slug, commentIndex, commentData);
  }

  /** Deletes a comment belonging to the post. */
  deleteComment(slug: string, commentIndex: string): Observable<Post> {
    return this.commentService.deleteComment(slug, commentIndex);
  }
}
