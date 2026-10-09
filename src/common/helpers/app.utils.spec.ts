import { ValidationPipe } from "@nestjs/common";

import { AppUtils } from "./app.utils";

class Account {
  self?: Account;
}

describe("AppUtils.validationPipeOptions", () => {
  // Regression: with `validateCustomDecorators` on, the global pipe ran the `@LoggedInUser()` entity
  // (a cyclic MikroORM graph) through `stripProtoKeys`, which overflowed the stack on every route
  // that injects the user.
  it("passes a cyclic custom-decorator value through untouched", async () => {
    const pipe = new ValidationPipe(AppUtils.validationPipeOptions());
    const account = new Account();
    account.self = account;

    await expect(pipe.transform(account, { metatype: Account, type: "custom" })).resolves.toBe(
      account,
    );
  });
});
