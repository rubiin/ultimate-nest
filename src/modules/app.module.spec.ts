import { AuthModule } from "@modules/auth/auth.module.js";
import { PostModule } from "@modules/post/post.module.js";
import { ProfileModule } from "@modules/profile/profile.module.js";
import { TagsModule } from "@modules/tags/tags.module.js";
import { TwoFactorModule } from "@modules/twofa/twofa.module.js";
import { UserModule } from "@modules/user/user.module.js";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { AppModule } from "./app.module.js";

// Only the feature-module wiring is under test; the real modules boot infrastructure.
vi.mock("@modules/shared/shared.module.js", () => ({ SharedModule: class SharedModule {} }));
vi.mock("@modules/app.controller.js", () => ({ AppController: class AppController {} }));
vi.mock("@modules/auth/auth.module.js", () => ({ AuthModule: class AuthModule {} }));
vi.mock("@modules/post/post.module.js", () => ({ PostModule: class PostModule {} }));
vi.mock("@modules/profile/profile.module.js", () => ({ ProfileModule: class ProfileModule {} }));
vi.mock("@modules/tags/tags.module.js", () => ({ TagsModule: class TagsModule {} }));
vi.mock("@modules/twofa/twofa.module.js", () => ({ TwoFactorModule: class TwoFactorModule {} }));
vi.mock("@modules/user/user.module.js", () => ({ UserModule: class UserModule {} }));

describe("AppModule", () => {
  // Regression: features lived in SharedModule, so a forgotten import silently disabled routes.
  it.each([AuthModule, PostModule, ProfileModule, UserModule, TagsModule, TwoFactorModule])(
    "imports %o",
    (feature) => {
      const imports: unknown[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);

      expect(imports).toContain(feature);
    },
  );
});
