import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
  exports: [HttpModule],
  imports: [
    HttpModule.register({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
      maxRedirects: 5,
      timeout: 9000,
      withCredentials: false,
    }),
  ],
})
export class NestHttpModule {}
