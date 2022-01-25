import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, Post, User } from '@entities';
import { CreatePostDto } from './dtos/create-post.dto';
import { EditPostDto } from './dtos/update-post.dto';
import { MikroORM, wrap } from '@mikro-orm/core';
import { CreateCommentDto, EditCommentDto } from './dtos/create-comment.dto';
import { paginate } from '@lib/pagination';

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
		private readonly orm: MikroORM,
	) {}

	async getManyPost(page: number, limit: number) {
		const qb = this.postRepository.createQueryBuilder('post');

		const offset = (page - 1) * limit;

		qb.select('*')
			.limit(limit)
			.offset(offset)
			.orderBy({ createdAt: 'desc' });

		const posts = await qb.getResult();

		return paginate<Post>(posts, {
			limit,
			page,
			route: 'http:localhost:8000/',
		});
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

		await this.orm.em.transactional(async em => {
			if (!user.favorites.contains(post)) {
				user.favorites.add(post);
				post.favoritesCount++;
			}

			em.persist(user);
			em.persist(post);
		});

		return post;
	}

	async unLikePost(idx: string, user: User) {
		const post = await this.getOnePost(idx);

		await this.orm.em.transactional(async em => {
			if (user.favorites.contains(post)) {
				user.favorites.remove(post);
				post.favoritesCount--;
			}
			em.persist(user);
			em.persist(post);
		});

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
