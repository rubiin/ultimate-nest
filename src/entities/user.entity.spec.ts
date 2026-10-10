import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

import * as entities from "../entities";
import { User } from "../entities";

describe("user entity serialization", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      allowGlobalContext: true,
      connect: false,
      dbName: "serialization_spec",
      driver: PostgreSqlDriver,
      entities: Object.values(entities).filter((e) => typeof e === "function") as never,
      metadataCache: { enabled: false },
      metadataProvider: TsMorphMetadataProvider,
    });
  }, 60_000);

  afterAll(async () => orm?.close());

  const build = (avatar?: string) => {
    const user = orm.em.create(User, {
      avatar,
      bio: "bio",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada",
    } as never);
    return user;
  };

  it("falls back to a ui-avatars URL when the user has no avatar", () => {
    const json = JSON.parse(JSON.stringify(build()));

    expect(json.avatar).toBe(
      "https://ui-avatars.com/api/?name=Ada+Lovelace&background=0D8ABC&color=fff",
    );
  });

  it("keeps the stored avatar when present", () => {
    const json = JSON.parse(JSON.stringify(build("https://cdn.example.com/a.png")));

    expect(json.avatar).toBe("https://cdn.example.com/a.png");
  });

  it("applies the fallback to a user nested in another entity", () => {
    const user = build();
    const post = orm.em.create(entities.Post, { author: user } as never);
    const json = JSON.parse(JSON.stringify(post));

    expect(json.author.avatar).toContain("ui-avatars.com");
  });

  it("does not expose password and keeps a single avatar key", () => {
    const json = JSON.parse(JSON.stringify(build()));

    expect(json).not.toHaveProperty("password");
    expect(Object.keys(json).filter((k) => k.toLowerCase().includes("avatar"))).toEqual(["avatar"]);
  });

  it("does not expose twoFactorSecret, directly or nested as post.author", () => {
    const user = build();
    user.twoFactorSecret = "totp-seed";
    const post = orm.em.create(entities.Post, { author: user } as never);

    expect(JSON.parse(JSON.stringify(user))).not.toHaveProperty("twoFactorSecret");
    expect(JSON.parse(JSON.stringify(post)).author).not.toHaveProperty("twoFactorSecret");
    expect(user.twoFactorSecret).toBe("totp-seed");
  });

  it("does not expose the otpCode of an OtpLog", () => {
    const log = orm.em.create(entities.OtpLog, {
      expiresIn: new Date(),
      otpCode: "123456",
      user: build(),
    } as never);

    expect(JSON.parse(JSON.stringify(log))).not.toHaveProperty("otpCode");
  });
});
