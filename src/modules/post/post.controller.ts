import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	ParseUUIDPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageMulterOption } from '@common/misc/misc';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { Post as Posts, User } from '@entities';
import { CreateCommentDto, EditCommentDto } from './dtos/create-comment.dto';
import { IResponse } from '@common/interfaces/response.interface';

@ApiTags('Posts routes')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
	constructor(private readonly postService: PostService) {}

	@ApiOperation({ summary: 'Get all user posts' })
	@Get()
	async getMany(): Promise<IResponse<Posts>> {
		const data = await this.postService.getManyPost();

		return { message: 'Success', data };
	}

	@ApiOperation({ summary: 'Create a post' })
	@Post()
	@UseInterceptors(FileInterceptor('file', ImageMulterOption))
	async createPost(
		@Body() dto: CreatePostDto,
		@UploadedFile() image: Express.Multer.File,
		@LoggedInUser() user: User,
	): Promise<IResponse<Posts>> {
		const data = await this.postService.createPost(
			{
				...dto,
				file: image.filename,
			},
			user,
		);

		return { message: 'Post created', data };
	}

	@ApiOperation({ summary: 'Get one user post' })
	@Get(':idx')
	async getOne(
		@Param('idx', ParseUUIDPipe) idx: string,
	): Promise<IResponse<Posts>> {
		const data = await this.postService.getOnePost(idx);

		return { message: 'success', data };
	}

	@ApiOperation({ summary: 'Edit user post' })
	@Put(':idx')
	async editOne(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() dto: EditPostDto,
	): Promise<IResponse<Posts>> {
		const data = await this.postService.editPost(idx, dto);

		return { message: 'Post edited', data };
	}

	@ApiOperation({ summary: 'Create comment' })
	@Post(':idx/comment')
	async createComment(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() createComment: CreateCommentDto,
		@LoggedInUser() user: User,
	): Promise<IResponse<any>> {
		const data = await this.postService.createComment(
			idx,
			createComment,
			user,
		);

		return { message: 'Comment created', data };
	}

	@ApiOperation({ summary: 'Like post' })
	@Post(':idx/favourite')
	async favouritePost(
		@Param('idx', ParseUUIDPipe) idx: string,
		@LoggedInUser() user: User,
	): Promise<IResponse<any>> {
		const data = await this.postService.likePost(idx, user);

		return { message: 'Post liked', data };
	}

	@ApiOperation({ summary: 'Unlike post' })
	@Delete(':idx/favourite/:favouriteIdx')
	async unFavouritePost(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Param('favouriteIdx', ParseUUIDPipe) favouriteIdx: string,
	): Promise<IResponse<any>> {
		const data = await this.postService.unLikePost(idx, favouriteIdx);

		return { message: 'Post unliked', data };
	}

	@ApiOperation({ summary: 'Edit comment' })
	@Put(':idx/comment/:commentIdx')
	async editComment(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Param('commentIdx', ParseUUIDPipe) commentIdx: string,
		@Body() dto: EditCommentDto,
	) {
		return this.postService.editComment(idx, commentIdx, dto);
	}

	@ApiOperation({ summary: 'Delete comment' })
	@Delete(':idx/comment/:commentIdx')
	async deleteComment(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Param('commentIdx', ParseUUIDPipe) commentIdx: string,
	) {
		return this.postService.deleteComment(idx, commentIdx);
	}

	@ApiOperation({ summary: 'Delete user post' })
	@Delete(':idx')
	async deleteOne(
		@Param('idx', ParseUUIDPipe) idx: string,
		@LoggedInUser() user: User,
	): Promise<IResponse<Posts>> {
		const data = await this.postService.deletePost(idx, user);

		return { message: 'Post deleted', data };
	}
}
