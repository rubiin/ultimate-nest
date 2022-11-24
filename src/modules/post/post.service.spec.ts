import { Comment, Post, User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { Test, TestingModule } from "@nestjs/testing";
import { PostService } from "./post.service";
import { createMock } from "@golevelup/ts-jest";
import { I18nService } from "nestjs-i18n";
import { BaseRepository } from "@common/database/base.repository";
import { mockedUser,mockedPost } from "../../_mocks_";
import { lastValueFrom } from "rxjs";
import { PageOptionsDto } from "@common/classes/pagination";
import { Order } from "@common/types/enums";

describe("PostService", () => {
  let service: PostService;

  const mockI18n = createMock<I18nService>();
  const mockPostRepo = createMock<BaseRepository<Post>>();
  const mockUserRepo = createMock<BaseRepository<User>>();
  const mockCommentRepo = createMock<BaseRepository<Comment>>();


  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService,

        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepo,
        },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });


  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it('should getById', async () => {
    const findOneSpy = mockPostRepo.findOne.mockImplementation(() =>
    Promise.resolve({
      ...mockedPost,
    } as any)
  )
    const foundPost = await lastValueFrom(service.getById('postId'));
    expect(foundPost).toEqual(mockedPost);
    expect(findOneSpy).toBeCalledWith({ idx: 'postId', isObsolete: false, isActive: true }, { populate: [] });
  });

  it("should get post list", async () => {
    const query: PageOptionsDto = {
      page: 1,
      limit: 10,
      offset: 5,
      sort: 'createdAt',
      order: Order.DESC
    };

    const findmanySpy =
      mockPostRepo.findAndPaginate.mockResolvedValue({
        results: [],
        total: 100,
      });

    const result = await lastValueFrom(service.getMany(query))

    expect(result.meta).toBeDefined();
    expect(result.links).toBeDefined();
    expect(result.items).toEqual([]);
    expect(findmanySpy).toHaveBeenCalled();
  });



	it("should create post", async () => {

    const user =new User(mockedUser);

    const createSpy = mockPostRepo.create.mockImplementation(() =>
    ({
      ...mockedPost,
      author: user
    } as any)
  )
    const result = await service.createOne(mockedPost,user);
    expect(createSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith({...mockedPost,author:user});
    expect(result).toEqual({...mockedPost,author:user});
  });




});
