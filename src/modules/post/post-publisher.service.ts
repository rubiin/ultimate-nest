import { PostStateEnum } from "@common/@types";
import { BaseRepository } from "@common/database";
import { Post } from "@entities";
import { EntityManager, RequestContext } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

const PUBLISH_BATCH_SIZE = 500;

@Injectable()
export class PostPublisherService {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
  ) {}

  /**
   * Goes live every post whose `publishAt` has passed, one minute at a time.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    // A cron job runs outside any HTTP request, so there is no request context to
    // fork from. Without this, the repository call runs on the global identity map.
    return RequestContext.create(this.em, async () => this.publishDuePosts());
  }

  /**
   * Promotes every `SCHEDULED` post that is due to `PUBLISHED`. Posts scheduled for a later
   * moment, or already published, are left alone.
   */
  private async publishDuePosts(): Promise<void> {
    // Process in batches so a backlog of scheduled posts is not loaded and locked all at once.
    while (true) {
      const posts = await this.postRepository.find(
        {
          publishAt: { $lte: new Date() },
          state: PostStateEnum.SCHEDULED,
        },
        { limit: PUBLISH_BATCH_SIZE },
      );

      if (posts.length === 0) return;

      for (const post of posts) {
        post.state = PostStateEnum.PUBLISHED;
        post.published = true;
      }

      await this.em.flush();

      if (posts.length < PUBLISH_BATCH_SIZE) return;
    }
  }
}
