import { validate } from "class-validator";

import { PaginationDto } from "./pagination.dto";

describe("paginationDto", () => {
  const errorsFor = async (dto: object) => await validate(dto);

  it("should accept the default withDeleted value", async () => {
    expect(await errorsFor(new PaginationDto())).toHaveLength(0);
  });

  it("should accept a boolean withDeleted value", async () => {
    const dto = Object.assign(new PaginationDto(), { withDeleted: true });

    expect(await errorsFor(dto)).toHaveLength(0);
  });

  it("should reject a non-boolean withDeleted value", async () => {
    const dto = Object.assign(new PaginationDto(), { withDeleted: "nope" });
    const errors = await errorsFor(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("withDeleted");
    expect(errors[0].constraints).toHaveProperty("isBoolean");
  });

  it("should treat withDeleted as optional", async () => {
    const dto = Object.assign(new PaginationDto(), { withDeleted: undefined });

    expect(await errorsFor(dto)).toHaveLength(0);
  });
});
