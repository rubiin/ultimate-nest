import { Action, Roles } from "@common/@types";
import { Comment, Post, User } from "@entities";

import { CaslAbilityFactory } from "./casl-ability.factory";

describe("caslAbilityFactory", () => {
  const factory = new CaslAbilityFactory();
  const admin = new User({ id: 1, roles: [Roles.ADMIN] });
  const author = new User({ id: 2, roles: [Roles.USER] });
  const other = new User({ id: 3, roles: [Roles.USER] });

  it("should be defined", () => {
    expect(new CaslAbilityFactory()).toBeDefined();
  });

  // Regression: `cannot(Action.Delete, User)` was applied after `can(Manage, all)`, so it
  // overrode the admin's manage permission and DELETE /users returned 403.
  it("should let an admin delete a user", () => {
    const ability = factory.createForUser(admin);

    expect(ability.can(Action.Delete, User)).toBe(true);
    expect(ability.can(Action.Delete, other)).toBe(true);
  });

  it("should not let an author delete a user", () => {
    const ability = factory.createForUser(author);

    expect(ability.can(Action.Delete, User)).toBe(false);
    expect(ability.can(Action.Delete, other)).toBe(false);
  });

  it("should leave the post and comment rules unchanged", () => {
    const ownPost = new Post({ author, id: 10 });
    const foreignPost = new Post({ author: other, id: 11 });
    const ownComment = new Comment({ author, id: 12 });
    const ability = factory.createForUser(author);

    expect(ability.can(Action.Update, ownPost)).toBe(true);
    expect(ability.can(Action.Delete, ownPost)).toBe(true);
    expect(ability.can(Action.Update, foreignPost)).toBe(false);
    expect(ability.can(Action.Delete, ownComment)).toBe(true);
    expect(ability.can(Action.Read, Post)).toBe(true);
  });
});
