import { Module } from "@nestjs/common";

import { CommentService } from "./comment.service";
import { FavoriteService } from "./favorite.service";
import { PostPublisherService } from "./post-publisher.service";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";

@Module({
  controllers: [PostController],
  providers: [CommentService, FavoriteService, PostPublisherService, PostService],
})
export class PostModule {}
