import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { OrmModule } from '@lib/orm/orm.module';
import { UserModule } from '@modules/user/user.module';
import { UserService } from '@modules/user/user.service';

@Module({
	controllers: [PostController],
	providers: [PostService, UserService],
	imports: [OrmModule, UserModule],
})
export class PostModule {}
