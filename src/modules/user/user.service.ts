import { PageOptionsDto } from "@common/classes/pagination";
import { EmailTemplateEnum } from "@common/constants/misc.enum";
import { BaseRepository } from "@common/database/base.repository";
import { IProfileData } from "@common/interfaces/followers.interface";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { CloudinaryService } from "@lib/cloudinary/cloudinary.service";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize } from "helper-fns";
import { I18nService } from "nestjs-i18n";
import { forkJoin, from, map, Observable, switchMap } from "rxjs";
import { CreateUserDto, EditUserDto } from "./dtos";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly orm: MikroORM,
		private readonly i18nService: I18nService,
		private readonly configService: ConfigService,
		private readonly amqpConnection: AmqpConnection,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	getMany({
		limit,
		offset,
		order,
		page,
	}: PageOptionsDto): Observable<Pagination<User>> {
		return from(
			this.userRepository.findAndPaginate(
				{ isObsolete: false, isActive: true },
				{
					limit,
					offset,
					orderBy: { createdAt: order.toLowerCase() },
				},
			),
		).pipe(
			map(({ results, total }) => {
				return createPaginationObject<User>(
					results,
					total,
					page,
					limit,
				);
			}),
		);
	}

	getOne(index: string, userEntity?: User): Observable<User> {
		return from(
			this.userRepository.findOne({
				idx: index,
				isObsolete: false,
				isActive: true,
			}),
		).pipe(
			map(u => {
				const user = !userEntity
					? u
					: !!u && userEntity.id === u.id
					? u
					: null;

				if (!user) {
					throw new NotFoundException(
						this.i18nService.t("status.USER_DOESNT_EXIST"),
					);
				} else {
					return user;
				}
			}),
		);
	}

	async createOne(
		dto: CreateUserDto & { image: Express.Multer.File },
	): Promise<User> {
		const userExist = await this.userRepository.findOne({
			email: dto.email,
		});

		if (userExist) {
			throw new BadRequestException(
				this.i18nService.t("status.USER_EMAIL_EXISTS"),
			);
		}

		const { image, ...rest } = dto;
		const user = this.userRepository.create(rest);

		await this.orm.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadImage(image);

			// cloudinary gives a url key on response that is the full url to file

			user.avatar = url;

			await em.persistAndFlush(user);

			await this.amqpConnection.publish("nestify", "send-mail", {
				template: EmailTemplateEnum.WELCOME_TEMPLATE,
				replacements: {
					firstName: capitalize(user.firstName),
					link: "example.com",
				},
				to: user.email,
				subject: "Welcome onboard",
				from: this.configService.get("mail.senderEmail"),
			});
		});

		return user;
	}

	editOne(
		index: string,
		dto: EditUserDto,
		userEntity?: User,
	): Observable<User> {
		return this.getOne(index, userEntity).pipe(
			switchMap(user => {
				wrap(user).assign(dto);

				return from(this.userRepository.flush()).pipe(map(() => user));
			}),
		);
	}

	deleteOne(index: string, userEntity?: User): Observable<User> {
		return this.getOne(index, userEntity).pipe(
			switchMap(user => {
				return from(this.userRepository.softRemoveAndFlush(user)).pipe(
					map(() => user),
				);
			}),
		);
	}
	follow(followerEmail: string, username: string): Observable<IProfileData> {
		if (!followerEmail || !username) {
			throw new BadRequestException(
				"Follower email and username not provided.",
			);
		}

		const followingUser$ = from(
			this.userRepository.findOne(
				{ username, isObsolete: false, isActive: true },
				{
					populate: ["followers"],
				},
			),
		);

		const followerUser$ = from(
			this.userRepository.findOne({
				email: followerEmail,
				isObsolete: false,
				isActive: true,
			}),
		);

		return forkJoin([followerUser$, followingUser$]).pipe(
			switchMap(([followerUser, followingUser]) => {
				if (followingUser.email === followerEmail) {
					throw new BadRequestException(
						"FollowerEmail and FollowingId cannot be equal.",
					);
				}

				followingUser.followers.add(followerUser);

				const profile: IProfileData = {
					following: true,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(
					map(() => profile),
				);
			}),
		);
	}

	unFollow(followerId: number, username: string): Observable<IProfileData> {
		if (!followerId || !username) {
			throw new BadRequestException(
				"FollowerId and username not provided.",
			);
		}

		const followingUser$ = from(
			this.userRepository.findOne(
				{ username, isObsolete: false, isActive: true },
				{
					populate: ["followers"],
				},
			),
		);

		return followingUser$.pipe(
			switchMap(followingUser => {
				const followerUser =
					this.userRepository.getReference(followerId);
				if (followingUser.id === followerId) {
					throw new BadRequestException(
						"FollowerId and FollowingId cannot be equal.",
					);
				}

				followingUser.followers.remove(followerUser);

				const profile: IProfileData = {
					following: false,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(
					map(() => profile),
				);
			}),
		);
	}
}
