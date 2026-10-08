import { PaginationType } from "@common/@types";
import { Tag } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockEm, mockTagsRepo, queryDto } from "@mocks";
import { NotFoundException } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { lastValueFrom, of } from "rxjs";

import { TagsService } from "./tags.service";

describe("tagsService", () => {
  let service: TagsService;

  const tag = { id: 1, idx: "tag-idx", title: "nestjs" };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockTagsRepo.getEntityManager.mockReturnValue(mockEm as never);
    mockTagsRepo.getEntityName.mockReturnValue("Tag");
    mockTagsRepo.create.mockImplementation(((dto: object) => ({ ...dto })) as never);
    mockTagsRepo.assign.mockImplementation(((entity: object, dto: object) =>
      Object.assign(entity, dto)) as never);
    mockTagsRepo.softRemoveAndFlush.mockReturnValue(of(tag) as never);
    mockTagsRepo.createQueryBuilder.mockReturnValue({} as never);
    mockTagsRepo.findOne.mockResolvedValue(tag as never);
    mockTagsRepo.qbCursorPagination.mockReturnValue(
      Promise.resolve({ data: [], meta: { total: 0 } }) as never,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [TagsService, { provide: getRepositoryToken(Tag), useValue: mockTagsRepo }],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create and return the entity", async () => {
    const result = await lastValueFrom(service.create({ title: "nestjs" }));

    expect(result).toEqual({ title: "nestjs" });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should find one by index", async () => {
    const result = await lastValueFrom(service.findOne("tag-idx"));

    expect(result).toBe(tag);
    expect(mockTagsRepo.findOne).toHaveBeenCalledWith({ idx: "tag-idx" });
  });

  it("should throw NotFoundException when the entity is missing", async () => {
    mockTagsRepo.findOne.mockResolvedValue(null as never);

    await expect(lastValueFrom(service.findOne("missing"))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("should update the entity", async () => {
    const result = await lastValueFrom(service.update("tag-idx", { title: "updated" }));

    expect(result).toBe(tag);
    expect(mockTagsRepo.assign).toHaveBeenCalledWith(tag, { title: "updated" });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should soft remove the entity", async () => {
    const result = await lastValueFrom(service.remove("tag-idx"));

    expect(result).toBe(tag);
    expect(mockTagsRepo.softRemoveAndFlush).toHaveBeenCalledWith(tag);
  });

  it("should paginate with the cursor query builder", async () => {
    const result = await lastValueFrom(
      service.findAll({ ...queryDto, type: PaginationType.CURSOR }),
    );

    expect(result).toEqual({ data: [], meta: { total: 0 } });
    expect(mockTagsRepo.createQueryBuilder).toHaveBeenCalledWith("t");
    expect(mockTagsRepo.qbCursorPagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pageOptionsDto: expect.objectContaining({
          alias: "t",
          cursor: "id",
          searchField: "title",
        }),
      }),
    );
  });
});
