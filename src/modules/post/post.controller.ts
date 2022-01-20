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
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageMulterOption } from '@common/misc/misc';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { User } from '@entities';
import { CreateCommentDto, EditCommentDto } from './dtos/create-comment.dto';

@ApiTags('Posts routes')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
	constructor(private readonly postService: PostService) {}

	@ApiOperation({ summary: 'Get all user posts' })
	@Get()
	async getMany() {
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
	) {
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
	@Get(':id')
	async getOne(@Param('id') id: number) {
		const data = await this.postService.getOnePost(id);

		return { data };
	}

	@ApiOperation({ summary: 'Edit user post' })
	@Put(':id')
	async editOne(@Param('id') id: number, @Body() dto: EditPostDto) {
		const data = await this.postService.editPost(id, dto);

		return { message: 'Post edited', data };
	}

	@ApiOperation({ summary: 'Create comment' })
	@Post(':id/comment')
	async createComment(
		@Param('id') id: number,
		@Body() createComment: CreateCommentDto,
		@LoggedInUser() user: User,
	) {
		const data = await this.postService.createComment(
			id,
			createComment,
			user,
		);

		return { data };
	}

	@ApiOperation({ summary: 'Edit comment' })
	@Put(':id/comment/:commentId')
	async editComment(
		@LoggedInUser() user: User,
		@Param() params: Record<string, string>,
		@Body() dto: EditCommentDto,
	) {
		const { id, commentId } = params;

		return this.postService.editComment(+id, +commentId, dto);
	}

	@ApiOperation({ summary: 'Delete comment' })
	@Delete(':id/comment/:commentId')
	async deleteComment(
		@LoggedInUser() user: User,
		@Param() params: Record<string, string>,
	) {
		const { id, commentId } = params;

		return this.postService.deleteComment(user, +id, +commentId);
	}

	@ApiOperation({ summary: 'Delete user post' })
	@Delete(':id')
	async deleteOne(@Param('id') id: number) {
		const data = await this.postService.deletePost(id);

		return { message: 'Post deleted', data };
	}
}
