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
import { ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageMulterOption } from '@common/misc/misc';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { User } from '@entities';

@ApiTags('Posts routes')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	async getMany() {
		const data = await this.postService.getMany();

		return { data };
	}

	@Post()
	@UseInterceptors(FileInterceptor('file', ImageMulterOption))
	async createPost(
		@Body() dto: CreatePostDto,
		@UploadedFile() image: Express.Multer.File,
		@LoggedInUser() user: User,
	) {
		const data = await this.postService.createOne(
			{
				...dto,
				file: image.filename,
			},
			user,
		);

		return { message: 'Post created', data };
	}

	@Get(':id')
	async getOne(@Param('id') id: number) {
		const data = await this.postService.getOne(id);

		return { data };
	}

	@Put(':id')
	async editOne(@Param('id') id: number, @Body() dto: EditPostDto) {
		const data = await this.postService.editOne(id, dto);

		return { message: 'Post edited', data };
	}

	@Delete(':id')
	async deleteOne(@Param('id') id: number) {
		const data = await this.postService.deleteOne(id);

		return { message: 'Post deleted', data };
	}
}
