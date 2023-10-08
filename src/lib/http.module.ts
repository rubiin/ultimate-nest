import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    HttpModule.register({
      timeout: 9000,
      maxRedirects: 5,
      withCredentials: false,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    }),
  ],
  exports: [HttpModule],
})
export class NestHttpModule {}
