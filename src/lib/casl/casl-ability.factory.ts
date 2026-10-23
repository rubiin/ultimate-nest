import { ExtractSubjectType, InferSubjects, MongoAbility, MongoQuery } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { Action, Roles } from "@common/@types";
import { Tag } from "@entities";
import { Comment, Post, User } from "@entities";
import { Injectable } from "@nestjs/common";

export type Subjects =
  | InferSubjects<typeof User | typeof Post | typeof Comment | typeof Tag>
  | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    /* Giving the user the ability to read and write to everything if they are an admin. */

    if (user.roles!.includes(Roles.ADMIN)) can(Action.Manage, "all"); // read-write access to everything
    else can(Action.Read, "all"); // read-only access to everything

    // user specific permissions
    can(Action.Update, User, { id: user.id });
    // Admins manage everything, so the delete ban must not be re-applied on top of it.
    if (!user.roles!.includes(Roles.ADMIN)) cannot(Action.Delete, User);

    // post specific permissions
    // Any authenticated user may create a post; ownership conditions apply to
    // update/delete only.
    can(Action.Create, Post);
    // Key on the author's id. A whole-entity { author: user } - and the nested
    // { author: { id } }, which Mongo semantics read as exact-document equality -
    // can never match a row loaded from the database, whose author is a different
    // instance. Only the dotted path matches a field, but CASL's MongoQuery type is
    // closed to dotted keys, so the condition is asserted to the library's query type.
    can([Action.Delete, Action.Update], Post, {
      "author.id": user.id,
    } as unknown as MongoQuery<Post>);

    // comment specific permissions
    can([Action.Update, Action.Delete], Comment, {
      "author.id": user.id,
    } as unknown as MongoQuery<Comment>);

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
