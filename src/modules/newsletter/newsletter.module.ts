import { Module } from "@nestjs/common";

import { NewsLetterConsumer } from "./newsletter.consumer";
import { NewsLetterController } from "./newsletter.controller";
import { NewsLetterService } from "./newsletter.service";

@Module({
  controllers: [NewsLetterController],
  providers: [NewsLetterService, NewsLetterConsumer],
})
export class NewsLetterModule {}
