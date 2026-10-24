import process from "node:process";

import { PaginationResponse, RecordWithFile } from "@common/@types";
import { OtpPurpose, QueryOrder, Queues, RoutingKey } from "@common/@types";
import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { Referral, User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { VerifyEmailMail, WelcomeMail, type WelcomeMailData } from "@lib/mail";
import { EntityManager } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ref } from "@mikro-orm/postgresql";
import { OtpService } from "@modules/otp";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mailer } from "@nestjs/mail";
import { type ResiliencePolicy, ResilienceService } from "@nestjs/resilience";
import { createId } from "@paralleldrive/cuid2";
import { capitalize, slugify } from "helper-fns";
import { CloudinaryService, IFile } from "nestjs-cloudinary";
import { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, tap, throwError } from "rxjs";

import { CreateUserDto, EditUserDto, ReferUserDto } from "./dtos";

@Injectable()
export class UserService {
  /**
   * Both presets as policies. The route that reaches `sendMail` is a broker
   * callback, which decorators never reach, and the one that reaches
   * `saveUserAndSendWelcome` is a write that must not be re-run - so either way
   * the bound and the breaker are applied here, shared with every other caller
   * of the same dependency.
   */
  private readonly mailPolicy: ResiliencePolicy;
  private readonly rabbitPolicy: ResiliencePolicy;

  constructor(
    @InjectRepository(User)
    private userRepository: BaseRepository<User>,
    @InjectRepository(Referral)
    private referralRepository: BaseRepository<Referral>,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService<Configs, true>,
    private readonly amqpConnection: AmqpConnection,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailer: Mailer,
    private readonly em: EntityManager<PostgreSqlDriver>,
    resilience: ResilienceService,
  ) {
    this.mailPolicy = resilience.preset("mail");
    this.rabbitPolicy = resilience.preset("rabbitmq");
  }

  @RabbitSubscribe({
    exchange: process.env.RABBITMQ_EXCHANGE,
    queue: Queues.MAIL,
    routingKey: RoutingKey.SEND_MAIL,
  })
  sendMail(payload: { to: string; data: WelcomeMailData }) {
    return from(
      this.mailPolicy.execute(
        () => this.mailer.send(WelcomeMail, { to: payload.to, data: payload.data }),
        { source: "UserService.sendMail" },
      ),
    ).pipe(tap(() => Logger.log(`✅ Sent mail to ${payload.to}`)));
  }

  /**
   * The function checks if a user with a given mobile number already exists, and if not, creates a
   * referral with the mobile number and the referrer user.
   * @param {ReferUserDto} dto - The `dto` parameter is an object of type `ReferUserDto` which contains
   * the data needed to refer a user. It likely includes properties such as `mobileNumber` which
   * represents the mobile number of the user being referred.
   * @param {User} user - The `user` parameter is an instance of the `User` class, which represents the
   * user who is referring another user.
   * @returns The function `referUser` returns an Observable of type `Referral`.
   */
  referUser(dto: ReferUserDto, user: User): Observable<Referral> {
    const userExists$ = from(
      this.userRepository.count({
        isActive: true,
        mobileNumber: dto.mobileNumber,
      }),
    );

    return userExists$.pipe(
      switchMap((count: number, _index: number) => {
        if (count > 0) {
          return throwError(
            () => new BadRequestException("User already registered with mobile number."),
          );
        }

        // return an empty observable or undefined based on your requirements
        return of(
          this.referralRepository.create({
            mobileNumber: dto.mobileNumber,
            referrer: ref(user),
          }),
        );
      }),
    );
  }

  /**
   * The function `findAll` retrieves a paginated list of users based on the provided cursor pagination
   * DTO.
   * @param dto - CursorPaginationDto - A data transfer object that contains the
   * pagination parameters for the query.
   * @returns The method is returning an Observable of type PaginationResponse<User>.
   */
  findAll(dto: CursorPaginationDto): Observable<PaginationResponse<User>> {
    return from(
      this.userRepository.cursorPagination({
        cursor: "username",
        order: QueryOrder.ASC,
        searchField: "firstName",
        ...dto,
      }),
    );
  }

  /**
   * It returns an observable of a user entity, which is either the user entity that was passed in, or
   * the user entity that was found in the database
   * @param index - string - the index of the user you want to get
   * @returns Observable<User>
   */
  findOne(index: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        idx: index,
      }),
    ).pipe(
      mergeMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "User" },
                }),
              ),
          );
        }

        return of(user);
      }),
    );
  }

  /**
   * It creates a user and sends a welcome email
   * @param dto - CreateWithFile<CreateUserDto>
   * @returns The user object
   */
  create(dto: RecordWithFile<CreateUserDto>): Observable<User> {
    const { files, ...rest } = dto;
    const user = this.userRepository.create({
      ...rest,
      avatar: "",
    });

    return from(this.cloudinaryService.uploadFile(files)).pipe(
      switchMap((response) => {
        user.avatar = response.url as string;

        return from(this.persistUser(user)).pipe(
          switchMap((otpCode) => this.sendWelcomeMail(user, otpCode)),
          map(() => user),
        );
      }),
    );
  }

  /**
   * Persists the user with a verification OTP inside one transaction.
   */
  @Transactional()
  private async persistUser(user: User): Promise<string> {
    const { otp, otpCode } = await this.otpService.create(user, OtpPurpose.VERIFY_EMAIL);
    await this.em.persist([user, otp]).flush();

    return otpCode;
  }

  private sendWelcomeMail(user: User, otpCode: string): Observable<unknown> {
    const welcomeMail$ = from(
      this.mailPolicy.execute(
        () =>
          this.mailer.send(VerifyEmailMail, {
            to: user.email,
            data: { firstName: capitalize(user.firstName), otp: otpCode },
          }),
        { source: "UserService.create" },
      ),
    );
    const link = this.configService.get("app.clientUrl", { infer: true });

    const publish$ = from(
      this.rabbitPolicy.execute(
        () =>
          this.amqpConnection.publish(
            this.configService.get("rabbitmq.exchange", { infer: true }),
            RoutingKey.SEND_MAIL,
            {
              to: user.email,
              data: { firstName: capitalize(user.firstName), link },
            },
          ),
        { source: "UserService.create" },
      ),
    );

    return welcomeMail$.pipe(switchMap(() => publish$));
  }

  /**
   * "Get a user, assign the DTO to it, and then flush the changes to the database."
   *
   * The first thing we do is get the user. We do this by calling the `findOne` function we created
   * earlier
   * @param index - string - the index of the user to edit
   * @param dto - EditUserDto
   * @param image - IFile
   * @returns Observable<User>
   */
  update(index: string, dto: EditUserDto, image?: IFile): Observable<User> {
    return this.findOne(index).pipe(
      switchMap((user) => {
        // `image` is optional, so the no-file path needs to fall through to a
        // flush rather than to an undefined observable.
        const uploadImage$: Observable<string | null> = image
          ? from(this.cloudinaryService.uploadFile(image)).pipe(map(({ url }) => url as string))
          : of(null);

        this.userRepository.assign(user, dto);

        return uploadImage$.pipe(
          switchMap((url) => {
            if (url) user.avatar = url;

            return from(this.userRepository.getEntityManager().flush()).pipe(map(() => user));
          }),
        );
      }),
    );
  }

  /**
   * "Get the user, then delete it."
   *
   * The first thing we do is get the user. We do this by calling the `findOne` function we just created
   * @param index - string - The index of the user to delete.
   * @returns Observable<User>
   */
  remove(index: string): Observable<User> {
    return this.findOne(index).pipe(
      switchMap((user) => {
        return this.userRepository.softRemoveAndFlush(user).pipe(map(() => user));
      }),
    );
  }

  /**
   * This function generates a unique username based on a given name and a random ID, and checks if it
   * already exists in the database before returning it.
   * @param name - The `name` parameter is a string representing the name of the user for whom
   * a username is being generated.
   * @returns An Observable of type string is being returned.
   */
  generateUsername(name: string): Observable<string> {
    const pointSlug = slugify(`${name} ${createId().slice(0, 6)}`);

    return from(
      this.userRepository.count({
        username: {
          $like: `${pointSlug}%`,
        },
      }),
    ).pipe(
      map((count) => {
        if (count > 0) return `${pointSlug}${count}`;

        return pointSlug;
      }),
    );
  }
}
