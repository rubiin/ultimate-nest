import { validate } from "class-validator";

import { EditUserDto } from "./edit-user.dto.js";

describe("EditUserDto", () => {
  it("rejects attempts to mass-assign roles", async () => {
    const dto = Object.assign(new EditUserDto(), { roles: ["ADMIN"] });

    const errors = await validate(dto as object, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors.some((error) => error.property === "roles")).toBe(true);
  });
});
