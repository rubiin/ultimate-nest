import { Category } from "@entities";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { mockCategoryRepo, mockEm } from "@mocks";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";

import { CategoryService } from "./category.service";

describe("categoryService", () => {
  let service: CategoryService;

  const category = { id: 1, idx: "category-idx", name: "tech" };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
    mockCategoryRepo.getEntityManager.mockReturnValue(mockEm as never);
    mockCategoryRepo.getEntityName.mockReturnValue("Category");
    mockCategoryRepo.create.mockImplementation(((dto: object) => ({ ...dto })) as never);
    mockCategoryRepo.assign.mockImplementation(((entity: object, dto: object) =>
      Object.assign(entity, dto)) as never);
    mockCategoryRepo.softRemoveAndFlush.mockReturnValue(of(category) as never);
    mockCategoryRepo.createQueryBuilder.mockReturnValue({} as never);
    mockCategoryRepo.qbOffsetPagination.mockReturnValue(
      of({ data: [], meta: { total: 0 } }) as never,
    );
    mockCategoryRepo.findOne.mockResolvedValue(category as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create and return the entity", async () => {
    const result = await lastValueFrom(service.create({ name: "tech" }));

    expect(result).toEqual({ name: "tech" });
    expect(mockEm.persist).toHaveBeenCalled();
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should find one by index", async () => {
    const result = await lastValueFrom(service.findOne("category-idx"));

    expect(result).toBe(category);
    expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({ idx: "category-idx" });
  });

  it("should throw NotFoundException when the entity is missing", async () => {
    mockCategoryRepo.findOne.mockResolvedValue(null as never);

    await expect(lastValueFrom(service.findOne("missing"))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("should update the entity", async () => {
    const result = await lastValueFrom(service.update("category-idx", { name: "updated" }));

    expect(result).toBe(category);
    expect(mockCategoryRepo.assign).toHaveBeenCalledWith(category, { name: "updated" });
    expect(mockEm.flush).toHaveBeenCalled();
  });

  it("should soft remove the entity", async () => {
    const result = await lastValueFrom(service.remove("category-idx"));

    expect(result).toBe(category);
    expect(mockCategoryRepo.softRemoveAndFlush).toHaveBeenCalledWith(category);
  });

  it("should paginate with the offset query builder", async () => {
    const result = await lastValueFrom(service.findAll({ type: "offset" } as never));

    expect(result).toEqual({ data: [], meta: { total: 0 } });
    expect(mockCategoryRepo.createQueryBuilder).toHaveBeenCalledWith("c");
    expect(mockCategoryRepo.qbOffsetPagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pageOptionsDto: expect.objectContaining({ alias: "c", searchField: "name" }),
      }),
    );
  });
});
