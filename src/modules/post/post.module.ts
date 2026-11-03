import { Module } from "@nestjs/common";

import { CommentService } from "./comment.service.js";
import { FavoriteService } from "./favorite.service.js";
import { PostPublisherService } from "./post-publisher.service.js";
import { PostController } from "./post.controller.js";
import { PostService } from "./post.service.js";

@Module({
  controllers: [PostController],
  providers: [CommentService, FavoriteService, PostPublisherService, PostService],
})
export class PostModule {}
