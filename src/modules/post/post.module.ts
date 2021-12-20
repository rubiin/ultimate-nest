import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	controllers: [PostController],
	providers: [PostService],
	imports: [OrmModule],
})
export class PostModule {}
