import {
	Controller,
	Get,
	Param,
	Post,
	Put,
	Delete,
	Body,
	ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { PostService } from './post.service';
import { User as UserEntity } from '@entities';
import { AppResource } from '@common/helpers/roles';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/update-post.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { LoggedInUser } from '@common/decorators/user.decorator';

@ApiTags('Posts')
@Controller('post')
export class PostController {
	constructor(
		private readonly postService: PostService,
		@InjectRolesBuilder()
		private readonly roleBuilder: RolesBuilder,
	) {}

	@Get()
	async getMany() {
		const data = await this.postService.getMany();
		return { data };
	}

	@Get(':id')
	async getById(@Param('id', ParseIntPipe) id: number) {
		const data = await this.postService.getById(id);
		return { data };
	}

	@Auth({
		resource: AppResource.POST,
		action: 'create',
		possession: 'own',
	})
	@Post()
	async createPost(
		@Body() dto: CreatePostDto,
		@LoggedInUser() author: UserEntity,
	) {
		const data = await this.postService.createOne(dto, author);
		return { message: 'Post created', data };
	}

	@Auth({
		resource: AppResource.POST,
		action: 'update',
		possession: 'own',
	})
	@Put(':id')
	async editOne(
		@Param('id') id: number,
		@Body() dto: EditPostDto,
		@LoggedInUser() author: UserEntity,
	) {
		let data;

		if (
			this.roleBuilder.can(author.roles).updateAny(AppResource.POST)
				.granted
		) {
			// Puede editar cualquier POST...
			data = await this.postService.editOne(id, dto);
		} else {
			// Puede editar solo los propios...
			data = await this.postService.editOne(id, dto, author);
		}

		return { message: 'Post edited', data };
	}

	@Auth({
		resource: AppResource.POST,
		action: 'delete',
		possession: 'own',
	})
	@Delete(':id')
	async deleteOne(
		@Param('id') id: number,
		@LoggedInUser() author: UserEntity,
	) {
		let data;

		if (
			this.roleBuilder.can(author.roles).deleteAny(AppResource.POST)
				.granted
		) {
			data = await this.postService.deleteOne(id);
		} else {
			data = await this.postService.deleteOne(id, author);
		}
		return { message: 'Post deleted', data };
	}
}
