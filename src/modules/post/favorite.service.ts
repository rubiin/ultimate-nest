import { BaseRepository } from "@common/database";
import { Post, User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { forkJoin, from, map, switchMap } from "rxjs";

@Injectable()
export class FavoriteService {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
  ) {}

  /**
   * "Find the post and user, add the post to the user's favorites, and increment the post's favorites
   * count."
   * @param userId - number - The id of the user who favorite the post.
   * @param slug - The slug of the post to be favorited.
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
            favorites: { isActive: true },
          },
        },
      ),
    );

    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        if (!user.favorites.contains(post)) {
          user.favorites.add(post);
          post.favoritesCount = (post.favoritesCount ?? 0) + 1;
        }

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * It finds a post and a user, checks if the user has favorited the post, if so, it removes the post
   * from the user's favorites and decrements the post's favorites count, then it saves the changes to
   * the database and returns the post
   * @param userId - number - The id of the user who favorite the post.
   * @param slug - The slug of the post to be favorited.
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
            favorites: { isActive: true },
          },
        },
      ),
    );

    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        if (user.favorites.contains(post)) {
          user.favorites.remove(post);
          post.favoritesCount = (post.favoritesCount ?? 0) - 1;
        }

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }
}
