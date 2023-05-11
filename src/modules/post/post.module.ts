import { Module } from "@nestjs/common";

import { PostController, PostService } from "./index";

@Module({
	controllers: [PostController],
	providers: [PostService],
})
export class PostModule {}
