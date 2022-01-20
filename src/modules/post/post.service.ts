import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, Post, User } from '@entities';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { wrap } from '@mikro-orm/core';
import { CreateCommentDto, EditCommentDto } from './dtos/create-comment.dto';

export interface UserFindOne {
	id?: number;
	email?: string;
}

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: EntityRepository<Post>,
		@InjectRepository(Comment)
		private readonly commentRepository: EntityRepository<Comment>,
	) {}

	async getManyPost() {
		return await this.postRepository.findAll();
	}

	async getOnePost(id: number) {
		const post = await this.postRepository.findOne(id);

		if (!post)
			throw new NotFoundException('Post does not exists or deleted');

		return post;
	}

	async getOneComment(id: number) {
		const comment = await this.commentRepository.findOne(id);

		if (!comment)
			throw new NotFoundException('Comment does not exists or deleted');

		return comment;
	}

	async createPost(dto: CreatePostDto, user: User) {
		const newPost = this.postRepository.create({ ...dto, user });

		await this.postRepository.persistAndFlush(newPost);

		return newPost;
	}

	async editPost(id: number, dto: EditPostDto) {
		const post = await this.getOnePost(id);

		wrap(post).assign(dto);
		await this.postRepository.flush();

		return post;
	}

	async createComment(id: number, dto: CreateCommentDto, user: User) {
		const post = await this.getOnePost(id);
		const comment = new Comment(user, post, dto.comment);

		await this.commentRepository.persistAndFlush(comment);

		return { comment, post };
	}

	async editComment(id: number, commentId: number, dto: EditCommentDto) {
		const comment = await this.getOneComment(commentId);
		const post = await this.getOnePost(id);

		comment.text = dto.comment;
		this.commentRepository.persist(comment);

		return { comment, post };
	}

	async deleteComment(user: User, id: number, commentId: number) {
		const post = await this.getOnePost(id);
		const comment = this.commentRepository.getReference(commentId);

		if (post.comment.contains(comment)) {
			post.comment.remove(comment);
			await this.commentRepository.removeAndFlush(comment);
		}

		return { post };
	}

	async deletePost(id: number) {
		const post = await this.getOnePost(id);

		return this.postRepository.remove(post);
	}

	async findOne(data: UserFindOne) {
		return await this.postRepository
			.createQueryBuilder()
			.where(data)
			.getSingleResult();
	}
}
