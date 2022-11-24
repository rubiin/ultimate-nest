import { User } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import { createMock } from "@golevelup/ts-jest";
import { I18nService } from "nestjs-i18n";
import { BaseRepository } from "@common/database/base.repository";
import { lastValueFrom } from "rxjs";
import { mockedUser } from "../../_mocks_";

describe("ProfileService", () => {
  let service: ProfileService;

  const mockI18n = createMock<I18nService>();
  const mockUserRepo = createMock<BaseRepository<User>>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService,

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });


  it("should be defined", () => {
    expect(service).toBeDefined();
  });


  it('should getProfileByUsername', async () => {
    const findOneSpy = mockUserRepo.findOne.mockImplementation(() =>
    Promise.resolve({
      ...mockedUser,
    } as any)
  )
    const foundProfile = await lastValueFrom(service.getProfileByUsername('username'));
    expect(foundProfile).toEqual(mockedUser);
    expect(findOneSpy).toBeCalledWith({ username: 'username', isObsolete: false, isActive: true }, { populate: [] });
  });

});
