import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, Favourite, Post, User } from '@entities';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { MikroORM, wrap } from '@mikro-orm/core';
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
		@InjectRepository(Favourite)
		private readonly likeRepository: EntityRepository<Favourite>,
		@InjectRepository(Comment)
		private readonly commentRepository: EntityRepository<Comment>,
		private readonly orm: MikroORM,
	) {}

	async getManyPost() {
		return await this.postRepository.findAll();
	}

	async getOnePost(idx: string) {
		const post = await this.postRepository.findOne({
			idx,
			isObsolete: false,
		});

		if (!post)
			throw new NotFoundException('Post does not exists or deleted');

		return post;
	}

	async getOneComment(idx: string) {
		const comment = await this.commentRepository.findOne({
			idx,
		});

		if (!comment)
			throw new NotFoundException('Comment does not exists or deleted');

		return comment;
	}

	async createPost(dto: CreatePostDto, user: User) {
		const newPost = this.postRepository.create({ ...dto, user });

		await this.orm.em.transactional(async em => {
			user.postCount++;

			em.persist(user);
			await em.persistAndFlush(newPost);
		});

		return newPost;
	}

	async editPost(idx: string, dto: EditPostDto) {
		const post = await this.getOnePost(idx);

		wrap(post).assign(dto);
		await this.postRepository.flush();

		return post;
	}

	async likePost(idx: string, user: User) {
		const post = await this.getOnePost(idx);
		const favourite = new Favourite(post, user);

		await this.orm.em.transactional(async em => {
			post.favouriteCount++;

			em.persist(post);
			await em.persistAndFlush(favourite);
		});

		return { favourite, post };
	}

	async unLikePost(idx: string, favouriteIdx: string) {
		const post = await this.getOnePost(idx);

		const favourite = await this.likeRepository.findOneOrFail({
			idx: favouriteIdx,
		});

		const favouriteRef = this.likeRepository.getReference(favourite.id);

		if (post.favourite.contains(favouriteRef)) {
			post.favourite.remove(favouriteRef);
			await this.likeRepository.removeAndFlush(favouriteRef);
		}

		return { post };
	}

	async createComment(idx: string, dto: CreateCommentDto, user: User) {
		const post = await this.getOnePost(idx);
		const comment = new Comment(user, post, dto.comment);

		await this.commentRepository.persistAndFlush(comment);

		return { comment, post };
	}

	async editComment(idx: string, commentIdx: string, dto: EditCommentDto) {
		const comment = await this.getOneComment(commentIdx);
		const post = await this.getOnePost(idx);

		comment.text = dto.comment;
		this.commentRepository.persist(comment);

		return { comment, post };
	}

	async deleteComment(idx: string, commentIdx: string) {
		const post = await this.getOnePost(idx);

		const comment = await this.getOneComment(commentIdx);

		const commentRef = this.commentRepository.getReference(comment.id);

		if (post.comment.contains(commentRef)) {
			post.comment.remove(commentRef);
			await this.commentRepository.removeAndFlush(commentRef);
		}

		return { post };
	}

	async deletePost(idx: string, user: User) {
		const post = await this.getOnePost(idx);

		await this.orm.em.transactional(async em => {
			user.postCount--;

			em.persist(user);
			await em.remove(post);
		});

		return post;
	}

	async findOne(data: UserFindOne) {
		return await this.postRepository
			.createQueryBuilder()
			.where(data)
			.getSingleResult();
	}
}
