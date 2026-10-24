import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { SharedModule } from "./shared.module";

// The real infrastructure modules validate the environment when they are imported; only the
// feature-module wiring is under test here.
vi.mock("@lib/index", () => {
  const stub = class {};

  return {
    NestCacheModule: stub,
    NestCaslModule: stub,
    NestCloudinaryModule: stub,
    NestConfigModule: stub,
    NestHttpModule: stub,
    NestI18nModule: stub,
    NestJwtModule: stub,
    NestMailModule: stub,
    NestPinoModule: stub,
    NestRabbitModule: stub,
    NestResilienceModule: stub,
    NestThrottlerModule: stub,
    OrmModule: stub,
  };
});

describe("SharedModule", () => {
  // Regression: feature modules belonged here, which is how four of them went unregistered.
  // They now live in AppModule; this asserts they do not creep back in.
  it.each([AuthModule, PostModule, ProfileModule, TwoFactorModule])(
    "does not import %o",
    (feature) => {
      const imports: unknown[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, SharedModule);

      expect(imports).not.toContain(feature);
    },
  );
});
