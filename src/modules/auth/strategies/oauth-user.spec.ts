import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";

import { resolveOauthUser } from "./oauth-user";

describe("resolveOauthUser", () => {
  let userRepo: BaseRepository<User>;

  const existingUser = { email: "ada@example.com", idx: "user-1" } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = createMock<BaseRepository<User>>();
    userRepo.create.mockImplementation(((dto: Record<string, unknown>) => ({
      ...dto,
    })) as never);
  });

  it("returns the existing user on a repeated sign-in", async () => {
    userRepo.findOne.mockResolvedValue(existingUser);

    const user = await resolveOauthUser(userRepo, { email: "ada@example.com" });

    expect(user).toBe(existingUser);
    expect(userRepo.findOne).toHaveBeenCalledWith({ email: "ada@example.com" });
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it("creates a user from the provider fields on first sign-in", async () => {
    userRepo.findOne.mockResolvedValue(null);

    const user = await resolveOauthUser(userRepo, {
      avatar: "https://cdn.example/pic.png",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada",
    });

    expect(userRepo.create).toHaveBeenCalledWith({
      avatar: "https://cdn.example/pic.png",
      bio: expect.any(String),
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      password: expect.any(String),
      username: "ada",
    });
    expect(user).toMatchObject({ email: "ada@example.com", username: "ada" });
  });

  // Providers may omit name, avatar and username; the user still has to be created with a
  // complete record, and the email doubles for the handle as it did before the extraction.
  it("fills missing profile fields with generated values", async () => {
    userRepo.findOne.mockResolvedValue(null);

    const user = await resolveOauthUser(userRepo, { email: "ada@example.com" });

    expect(user.avatar).toEqual(expect.any(String));
    expect(user.firstName).toEqual(expect.any(String));
    expect(user.lastName).toEqual(expect.any(String));
    expect(user.bio).toEqual(expect.any(String));
    expect(user.password).toHaveLength(10);
    expect(user.username).toBe("ada@example.com");
  });
});
