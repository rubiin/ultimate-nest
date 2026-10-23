import { BaseRepository } from "@common/database";
import { Comment, Post, User } from "@entities";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { AutoPath, EntityKey, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver, ref } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";
import { forkJoin, from, map, of, switchMap, throwError } from "rxjs";

import { CreateCommentDto } from "./dtos";

@Injectable()
export class CommentService {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: BaseRepository<Comment>,
  ) {}

  /** Loads the post or raises the same 404 the rest of the module uses. */
  private findOne(
    slug: string,
    populate: AutoPath<Post, EntityKey<Post>>[] = [],
  ): Observable<Post> {
    return from(this.postRepository.findOne({ slug }, { populate })).pipe(
      switchMap((post) => {
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
   * It finds a post by slug, and then returns the comments of that post
   * @param slug - string - The slug of the post to find comments for.
   * @returns An array of comments
   */
  findComments(slug: string): Observable<Comment[]> {
    return from(
      this.postRepository.findOne(
        { slug },
        {
          populate: ["comments"],
          populateWhere: {
            comments: { isActive: true },
          },
        },
      ),
    ).pipe(
      switchMap((post) => {
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
        return of(post.comments.getItems());
      }),
    );
  }

  /**
   * It takes a userId, a post slug, and a DTO, and returns an observable of a post
   * @param userId - number,
   * @param slug - string - the slug of the post to add the comment to
   * @param dto - CreateCommentDto
   * @returns Post
   */
  addComment(userId: number, slug: string, dto: CreateCommentDto): Observable<Post> {
    const post$ = this.findOne(slug);
    const user$ = from(this.userRepository.findOneOrFail(userId));

    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        const comment = new Comment({ author: ref(user), body: dto.body });

        post.comments.add(comment);

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * This function edits a comment on a post using data from a DTO and returns the updated post.
   * @param slug - A string representing the slug of the post to which the comment belongs.
   * @param commentIndex - commentIndex is a string parameter that represents the unique
   * @param commentData - commentData is an object of type CreateCommentDto
   * @returns The `editComment` method is returning an Observable that emits the updated post data after
   * editing the comment specified by `commentIndex` in the post specified by `slug`.
   */
  editComment(slug: string, commentIndex: string, commentData: CreateCommentDto): Observable<Post> {
    return this.findOne(slug, ["comments"]).pipe(
      switchMap((_post) => {
        return from(this.commentRepository.findOneOrFail({ idx: commentIndex })).pipe(
          switchMap((comment) => {
            this.commentRepository.assign(comment, commentData);

            return from(this.em.flush()).pipe(map(() => _post));
          }),
        );
      }),
    );
  }

  /**
   * It finds a post and a comment, removes the comment from the post, and then deletes the comment
   * @param slug - string - The id of the post
   * @param commentIndex - The id of the comment to be deleted
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

          return from(this.em.remove(commentReference).flush()).pipe(map(() => post));
        }

        return of(post);
      }),
    );
  }
}
