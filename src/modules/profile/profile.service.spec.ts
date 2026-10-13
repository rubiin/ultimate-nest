import { User } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { mockEm, mockUserRepo, mockedUser } from "@mocks";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";

import { ProfileService } from "./profile.service";

describe("profileService", () => {
  let service: ProfileService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should getProfileByUsername", () => {
    service.getProfileByUsername("username").subscribe((result) => {
      expect(result).toStrictEqual(mockedUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith(
        { username: "username" },
        {
          populate: [],
          populateWhere: {
            favorites: { isActive: true },
            followed: { isActive: true },
            followers: { isActive: true },
            posts: { isActive: true },
          },
        },
      );
    });
  });

  describe("follow", () => {
    // Stands in for a real Collection: `add` records what was added so the test can assert
    // the relation was written without the collection being loaded first.
    const stubTarget = () => {
      const added: unknown[] = [];
      const target = {
        ...mockedUser,
        followers: {
          add: (user: unknown) => {
            added.push(user);
          },
        },
        id: 7,
        username: "target",
      };

      return { added, target };
    };

    beforeEach(() => {
      mockEm.flush.mockResolvedValue(undefined);
      mockUserRepo.exists.mockReturnValue(of(false));
    });

    // Regression: `follow` populated `followers` to perform a one-row insert, so a user with
    // a large following list paid for a full collection load.
    it("should not populate the followers collection", async () => {
      const { target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);

      await lastValueFrom(service.follow({ username: "actor" } as User, "target"));

      expect(mockUserRepo.findOne).toHaveBeenCalledWith(
        { username: "target" },
        expect.objectContaining({ populate: [] }),
      );
    });

    it("should add the follower and flush when not already following", async () => {
      const { added, target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);
      const actor = { username: "actor" } as User;

      const profile = await lastValueFrom(service.follow(actor, "target"));

      expect(added).toEqual([actor]);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(profile).toEqual({ avatar: mockedUser.avatar, following: true, username: "target" });
    });

    // The pivot is keyed on (follower, following), so a duplicate follow would raise a
    // unique violation rather than no-op like it did when the collection was populated.
    it("should skip the insert when already following", async () => {
      const { added, target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);
      mockUserRepo.exists.mockReturnValue(of(true));

      await lastValueFrom(service.follow({ username: "actor" } as User, "target"));

      expect(added).toEqual([]);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it("should reject following yourself", async () => {
      const { target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);

      await expect(
        lastValueFrom(service.follow({ username: "target" } as User, "target")),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("should reject an empty target username before hitting the database", async () => {
      await expect(
        lastValueFrom(service.follow({ username: "actor" } as User, "")),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    });

    it("should surface an unknown username as a 404", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(
        lastValueFrom(service.follow({ username: "actor" } as User, "ghost")),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("getProfileByUsername", () => {
    it("should reject an unknown username with a 404", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(lastValueFrom(service.getProfileByUsername("ghost"))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("unFollow", () => {
    // Stands in for the populated `followers` collection: `remove` records the removal so the
    // test can assert the relation was unwritten without loading every follower row.
    const stubTarget = () => {
      const removed: unknown[] = [];
      const target = {
        ...mockedUser,
        followers: { remove: (user: unknown) => removed.push(user) },
        id: 7,
        username: "target",
      };

      return { removed, target };
    };

    beforeEach(() => {
      mockEm.flush.mockResolvedValue(undefined);
    });

    it("should remove the follower and flush", async () => {
      const { removed, target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);
      mockUserRepo.getReference.mockImplementation(((id: number) => ({ id })) as never);
      const actor = { id: 9, username: "actor" } as User;

      const profile = await lastValueFrom(service.unFollow(actor, "target"));

      expect(removed).toEqual([{ id: 9 }]);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(profile).toEqual({ avatar: mockedUser.avatar, following: false, username: "target" });
    });

    it("should load the followers collection so the removal is written to the pivot", async () => {
      const { target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);

      await lastValueFrom(service.unFollow({ id: 9, username: "actor" } as User, "target"));

      expect(mockUserRepo.findOne).toHaveBeenCalledWith(
        { username: "target" },
        expect.objectContaining({ populate: ["followers"] }),
      );
    });

    it("should reject unfollowing yourself", async () => {
      const { target } = stubTarget();
      mockUserRepo.findOne.mockResolvedValue(target as never);

      await expect(
        lastValueFrom(service.unFollow({ id: 7, username: "target" } as User, "target")),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockEm.flush).not.toHaveBeenCalled();
    });

    it("should reject an empty username before hitting the database", async () => {
      await expect(
        lastValueFrom(service.unFollow({ id: 9, username: "actor" } as User, "")),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    });

    it("should surface an unknown username as a 404", async () => {
      mockUserRepo.findOne.mockResolvedValue(null as never);

      await expect(
        lastValueFrom(service.unFollow({ id: 9, username: "actor" } as User, "ghost")),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
