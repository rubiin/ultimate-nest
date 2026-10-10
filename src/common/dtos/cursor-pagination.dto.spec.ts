import { Cursor } from "@mikro-orm/core";
import { validate } from "class-validator";

import { CursorPaginationDto } from "./cursor-pagination.dto";

describe("cursorPaginationDto", () => {
  const withAfter = (after: string) => Object.assign(new CursorPaginationDto(), { after });

  it("should accept an unpadded base64url cursor token", async () => {
    // `["b"]` encodes to 7 characters, so the token is only valid without padding.
    const after = Cursor.encode(["b"]);

    expect(after).not.toContain("=");
    expect(await validate(withAfter(after))).toHaveLength(0);
  });

  it("should reject a cursor that is not base64", async () => {
    const errors = await validate(withAfter("not base64!"));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("after");
    expect(errors[0].constraints).toHaveProperty("isBase64");
  });
});
