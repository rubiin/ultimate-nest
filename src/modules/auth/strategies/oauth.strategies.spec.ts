import { mockConfigService, mockUserRepo } from "@mocks";
import { ConfigService } from "@nestjs/config";
import { Profile } from "passport-facebook";
import { VerifyCallback } from "passport-google-oauth20";

import { FacebookStrategy } from "./facebook.strategy";
import { GoogleStrategy } from "./google.strategy";

describe("oauth strategies", () => {
  const configService = mockConfigService as unknown as ConfigService<Configs, true>;

  describe("GoogleStrategy", () => {
    it("should resolve an existing account by email", async () => {
      const config = configService;
      const existing = { email: "a@example.com" } as never;
      vi.mocked(mockUserRepo.findOne).mockResolvedValue(existing as never);
      const done = vi.fn<VerifyCallback>();

      const strategy = new GoogleStrategy(config, mockUserRepo);
      await strategy.validate(
        "access",
        "refresh",
        { emails: [{ value: "a@example.com" }] } as never,
        done,
      );

      expect(done).toHaveBeenCalledWith(undefined, existing);
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it("should create an account on first sign-in", async () => {
      const config = configService;
      vi.mocked(mockUserRepo.findOne).mockResolvedValue(null as never);
      vi.mocked(mockUserRepo.create).mockImplementation(((data: object) => ({ ...data })) as never);
      const done = vi.fn<VerifyCallback>();

      const strategy = new GoogleStrategy(config, mockUserRepo);
      await strategy.validate(
        "access",
        "refresh",
        {
          displayName: "Ada Lovelace",
          emails: [{ value: "a@example.com" }],
          name: { familyName: "Lovelace", givenName: "Ada" },
          photos: [{ value: "https://cdn/ada.png" }],
          username: "ada",
        } as never,
        done,
      );

      const user = done.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(user).toMatchObject({
        avatar: "https://cdn/ada.png",
        email: "a@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        username: "ada",
      });
      expect(mockUserRepo.create).toHaveBeenCalled();
    });
  });

  describe("FacebookStrategy", () => {
    it("should resolve an existing account by email", async () => {
      const config = configService;
      const existing = { email: "a@example.com" } as never;
      vi.mocked(mockUserRepo.findOne).mockResolvedValue(existing as never);
      const done = vi.fn<VerifyCallback>();

      const strategy = new FacebookStrategy(config, mockUserRepo);
      await strategy.validate(
        "access",
        "refresh",
        { emails: [{ value: "a@example.com" }] } as Profile,
        done,
      );

      expect(done).toHaveBeenCalledWith(undefined, existing);
    });

    it("should create an account and fall back to generated names", async () => {
      const config = configService;
      vi.mocked(mockUserRepo.findOne).mockResolvedValue(null as never);
      vi.mocked(mockUserRepo.create).mockImplementation(((data: object) => ({ ...data })) as never);
      const done = vi.fn<VerifyCallback>();

      const strategy = new FacebookStrategy(config, mockUserRepo);
      await strategy.validate(
        "access",
        "refresh",
        { emails: [{ value: "a@example.com" }] } as Profile,
        done,
      );

      const user = done.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(user).toMatchObject({ email: "a@example.com", username: "a@example.com" });
      expect(user.firstName).toBeTypeOf("string");
      expect(user.avatar).toBeTypeOf("string");
      expect(user.password).toBeTypeOf("string");
    });
  });
});
