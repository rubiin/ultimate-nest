import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TagsModule } from "@modules/tags/tags.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { AppModule } from "./app.module";

// Only the feature-module wiring is under test; the real modules boot infrastructure.
vi.mock("@modules/shared/shared.module", () => ({ SharedModule: class SharedModule {} }));
vi.mock("@modules/app.controller", () => ({ AppController: class AppController {} }));
vi.mock("@modules/auth/auth.module", () => ({ AuthModule: class AuthModule {} }));
vi.mock("@modules/post/post.module", () => ({ PostModule: class PostModule {} }));
vi.mock("@modules/profile/profile.module", () => ({ ProfileModule: class ProfileModule {} }));
vi.mock("@modules/tags/tags.module", () => ({ TagsModule: class TagsModule {} }));
vi.mock("@modules/twofa/twofa.module", () => ({ TwoFactorModule: class TwoFactorModule {} }));
vi.mock("@modules/user/user.module", () => ({ UserModule: class UserModule {} }));

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
