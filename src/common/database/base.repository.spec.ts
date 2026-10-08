import { Buffer } from "node:buffer";

import { CursorType } from "@common/@types";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { EntityManager } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loggedInUser } from "@mocks";
import { NotFoundException } from "@nestjs/common";
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

  describe("cursor encoding", () => {
    it("should round trip a string cursor", () => {
      const encoded = userRepo.encodeCursor("some-id");

      expect(userRepo.decodeCursor(encoded)).toEqual("some-id");
    });

    it("should round trip a number cursor", () => {
      const encoded = userRepo.encodeCursor(42);

      expect(userRepo.decodeCursor(encoded, CursorType.NUMBER)).toEqual(42);
    });

    it("should round trip a date cursor", () => {
      const date = new Date("2020-06-07T14:34:08.000Z");
      const decoded = userRepo.decodeCursor(userRepo.encodeCursor(date), CursorType.DATE);

      expect(decoded).toBeInstanceOf(Date);
      expect((decoded as Date).getTime()).toEqual(date.getTime());
    });

    it("should encode as base64", () => {
      expect(userRepo.encodeCursor("some-id")).toEqual(
        Buffer.from("some-id", "utf8").toString("base64"),
      );
    });

    it("should throw on a non-numeric number cursor", () => {
      const encoded = userRepo.encodeCursor("not-a-number");

      expect(() => userRepo.decodeCursor(encoded, CursorType.NUMBER)).toThrow();
    });

    it("should throw on a non-numeric date cursor", () => {
      const encoded = userRepo.encodeCursor("not-a-date");

      expect(() => userRepo.decodeCursor(encoded, CursorType.DATE)).toThrow();
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
