import { join } from "node:path";

import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  exports: [ServeStaticModule],
  imports: [
    ServeStaticModule.forRoot({
      exclude: [
        "/api/(.*path)",
        "/v1/(.*path)",
        "/graphql/(.*path)",
        "/docs/(.*path)",
        "/health/(.*path)",
        "/swagger/(.*path)",
      ],
      rootPath: join(__dirname, "resources"),
      serveStaticOptions: {
        maxAge: 86_400, // 1 day,
      },
    }),
  ],
})
export class NestServeStaticModule {}
