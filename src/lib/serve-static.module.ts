import { join } from "node:path"

import { Module } from "@nestjs/common"
import { ServeStaticModule } from "@nestjs/serve-static"

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "resources"),
      serveStaticOptions: {
        maxAge: 86_400, // 1 day,
      },
      exclude: ["/api/(.*)", "/v1/(.*)", "/graphql/(.*)", "/docs/(.*)", "/health/(.*)", "/swagger/(.*)"],
    }),
  ],
  exports: [ServeStaticModule],
})
export class NestServeStaticModule {}
