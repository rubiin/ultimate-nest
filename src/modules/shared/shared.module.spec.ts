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
    NestThrottlerModule: stub,
    OrmModule: stub,
  };
});

describe("SharedModule", () => {
  // Regression: these feature modules were dropped from the import list, so their routes were
  // never registered and every /auth, /posts, /profiles and /2fa request was a 404.
  it.each([AuthModule, PostModule, ProfileModule, TwoFactorModule])("imports %o", (feature) => {
    const imports: unknown[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, SharedModule);

    expect(imports).toContain(feature);
  });
});
