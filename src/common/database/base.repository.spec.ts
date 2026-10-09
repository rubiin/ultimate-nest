import { QueryOrder } from "@common/@types";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { Cursor, CursorError, EntityManager, ReferenceKind } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loggedInUser } from "@mocks";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { BaseRepository } from "./base.repository";

describe("baseRepository", () => {
  const mockEm = createMock<EntityManager<PostgreSqlDriver>>();
  const userRepo = new BaseRepository(mockEm as never, User);

  beforeEach(() => {
    vi.clearAllMocks();

    mockEm.persist.mockReturnValue(mockEm);
    mockEm.flush.mockResolvedValue(undefined);
  });

  it("should be defined", () => {
    expect(userRepo).toBeDefined();
  });

  it("should softremove and flush", async () => {
    userRepo.softRemoveAndFlush(loggedInUser).subscribe((result) => {
      expect(result.isDeleted).toEqual(true);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  it("should softremove", () => {
    userRepo.softRemove(loggedInUser);

    expect(loggedInUser.isDeleted).toEqual(true);
  });

  describe("cursorPagination", () => {
    // A real `Cursor`, so overfetch trimming and cursor encoding come from MikroORM itself.
    const meta = { properties: { username: { kind: ReferenceKind.SCALAR, name: "username" } } };
    const stubPage = (usernames: string[], options: object) => {
      const page = new Cursor(
        usernames.map((username) => ({ username })) as never,
        undefined,
        { first: 2, orderBy: { username: "ASC" }, overfetch: true, ...options } as never,
        meta as never,
      );

      mockEm.findByCursor.mockResolvedValue(page as never);
    };
    const options = {
      cursor: "username" as const,
      fields: [],
      first: 2,
      order: QueryOrder.ASC,
      relations: [],
      searchField: "firstName" as const,
      withDeleted: false,
    };

    it("should fetch the first page ordered by the cursor field without a count", async () => {
      stubPage(["a", "b", "c"], {});

      const result = await userRepo.cursorPagination(options);

      expect(mockEm.findByCursor).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          after: undefined,
          filters: { softDelete: true },
          first: 2,
          includeCount: false,
          orderBy: { username: QueryOrder.ASC },
          where: {},
        }),
      );
      expect(result).toEqual({
        data: [{ username: "a" }, { username: "b" }],
        meta: {
          hasNextPage: true,
          hasPreviousPage: false,
          nextCursor: Cursor.encode(["b"]),
          search: "",
        },
      });
    });

    it("should fetch the page after the given cursor", async () => {
      const after = Cursor.encode(["b"]);

      stubPage(["c"], { after });

      const result = await userRepo.cursorPagination({ ...options, after });

      expect(mockEm.findByCursor).toHaveBeenCalledWith(User, expect.objectContaining({ after }));
      expect(result.meta).toEqual({
        hasNextPage: false,
        hasPreviousPage: true,
        nextCursor: Cursor.encode(["c"]),
        search: "",
      });
    });

    it("should return an empty cursor for an empty page", async () => {
      stubPage([], {});

      const result = await userRepo.cursorPagination(options);

      expect(result.meta.nextCursor).toEqual("");
    });

    it("should search the search field and bound the creation date", async () => {
      const from = new Date("2020-01-01T00:00:00.000Z");
      const to = new Date("2021-01-01T00:00:00.000Z");

      stubPage([], {});

      const result = await userRepo.cursorPagination({ ...options, from, search: "jo", to });

      expect(mockEm.findByCursor).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          where: { createdAt: { $gte: from, $lte: to }, firstName: { $ilike: "%jo%" } },
        }),
      );
      expect(result.meta.search).toEqual("jo");
    });

    it("should disable the softDelete filter when withDeleted is set", async () => {
      stubPage([], {});

      await userRepo.cursorPagination({ ...options, withDeleted: true });

      expect(mockEm.findByCursor).toHaveBeenCalledWith(
        User,
        expect.objectContaining({ filters: { softDelete: false } }),
      );
    });

    it("should always select the id and cursor fields alongside requested fields", async () => {
      stubPage([], {});

      await userRepo.cursorPagination({ ...options, fields: ["firstName"] });

      expect(mockEm.findByCursor).toHaveBeenCalledWith(
        User,
        expect.objectContaining({ fields: ["firstName", "id", "username"] }),
      );
    });

    it("should reject a malformed cursor as a bad request", async () => {
      mockEm.findByCursor.mockRejectedValue(
        CursorError.invalidCursor("User", new SyntaxError("Unexpected token")),
      );

      await expect(
        userRepo.cursorPagination({ ...options, after: "bm90LWpzb24" }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("findAndPaginate", () => {
    it("should map the tuple onto results and total", async () => {
      mockEm.findAndCount.mockResolvedValue([[loggedInUser], 1] as never);

      const result = await lastValueFrom(userRepo.findAndPaginate({ id: 1 }));

      expect(result).toEqual({ results: [loggedInUser], total: 1 });
    });
  });

  describe("exists", () => {
    const stubQueryBuilder = (count: number) => {
      const getCount = vi.fn().mockResolvedValue(count);
      const where = vi.fn().mockReturnValue({ getCount });
      const qb = vi.spyOn(userRepo, "qb").mockReturnValue({ where } as never);

      return { getCount, qb, where };
    };

    it("should be true when a matching row exists", async () => {
      const { getCount } = stubQueryBuilder(1);

      await expect(lastValueFrom(userRepo.exists({ id: 1 }))).resolves.toBe(true);
      expect(getCount).toHaveBeenCalled();
    });

    it("should be false when no row matches", async () => {
      stubQueryBuilder(0);

      await expect(lastValueFrom(userRepo.exists({ id: 1 }))).resolves.toBe(false);
    });
  });

  describe("findAndSoftDelete", () => {
    it("should soft remove the found entity", async () => {
      vi.spyOn(userRepo, "findOne").mockResolvedValue(loggedInUser as never);

      const result = await lastValueFrom(userRepo.findAndSoftDelete({ id: 1 }));

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw NotFoundException when nothing matches", async () => {
      vi.spyOn(userRepo, "findOne").mockResolvedValue(null as never);

      await expect(lastValueFrom(userRepo.findAndSoftDelete({ id: 1 }))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("findAndDelete", () => {
    it("should remove the found entity", async () => {
      vi.spyOn(userRepo, "findOne").mockResolvedValue(loggedInUser as never);

      const result = await lastValueFrom(userRepo.findAndDelete({ id: 1 }));

      expect(result).toBe(loggedInUser);
      expect(mockEm.remove).toHaveBeenCalledWith(loggedInUser);
    });

    it("should throw NotFoundException when nothing matches", async () => {
      vi.spyOn(userRepo, "findOne").mockResolvedValue(null as never);

      await expect(lastValueFrom(userRepo.findAndDelete({ id: 1 }))).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockEm.remove).not.toHaveBeenCalled();
    });
  });

  describe("soft-delete filtering", () => {
    // QueryBuilder never applies entity filters on its own, so the repository has to
    // toggle `softDelete` explicitly. `withDeleted` means "also include deleted rows",
    // which is the inverse of the filter's enabled state.
    const stubQueryBuilder = () => {
      const qb = {
        andWhere: vi.fn(),
        applyFilters: vi.fn().mockResolvedValue(undefined),
        getResultAndCount: vi.fn().mockResolvedValue([[], 0]),
        leftJoinAndSelect: vi.fn(),
        limit: vi.fn(),
        offset: vi.fn(),
        orderBy: vi.fn(),
        select: vi.fn(),
        where: vi.fn(),
      };

      qb.select.mockReturnValue(qb);
      qb.orderBy.mockReturnValue(qb);
      qb.limit.mockReturnValue(qb);
      qb.offset.mockReturnValue(qb);
      qb.andWhere.mockReturnValue(qb);
      qb.where.mockReturnValue(qb);

      return qb;
    };

    const baseOptions = {
      alias: "u",
      fields: [],
      from: undefined,
      limit: 10,
      offset: 0,
      order: QueryOrder.ASC,
      relations: [],
      search: "",
      searchField: "username",
      sort: "createdAt",
      to: undefined,
    };

    it("should enable the softDelete filter for offset pagination by default", async () => {
      const qb = stubQueryBuilder();

      await userRepo.qbOffsetPagination({
        pageOptionsDto: { ...baseOptions, withDeleted: false },
        qb: qb as never,
      });

      expect(qb.applyFilters).toHaveBeenCalledWith({ softDelete: true });
    });

    it("should disable the softDelete filter for offset pagination when withDeleted is set", async () => {
      const qb = stubQueryBuilder();

      await userRepo.qbOffsetPagination({
        pageOptionsDto: { ...baseOptions, withDeleted: true },
        qb: qb as never,
      });

      expect(qb.applyFilters).toHaveBeenCalledWith({ softDelete: false });
    });
  });

  describe("getEntityName", () => {
    it("should return the entity class name from the ORM metadata", () => {
      mockEm.getMetadata.mockReturnValue({ className: "User" } as never);

      expect(userRepo.getEntityName()).toEqual("User");
    });
  });

  describe("delete", () => {
    it("should remove the entity and return it", () => {
      const result = userRepo.delete(loggedInUser);

      expect(result).toBe(loggedInUser);
      expect(mockEm.remove).toHaveBeenCalledWith(loggedInUser);
    });
  });
});
