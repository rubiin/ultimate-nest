import { NestCaslModule } from "@lib/casl/casl.module";
import { OrmModule } from "@lib/orm/orm.module";
import { Module } from "@nestjs/common";

import { PostController } from "./post.controller";
import { PostService } from "./post.service";

@Module({
	imports: [OrmModule, NestCaslModule],
	controllers: [PostController],
	providers: [PostService],
})
export class PostModule {}
