import { Module } from "@nestjs/common";

import { NewsLetterConsumer } from "./newsletter.consumer.js";
import { NewsLetterController } from "./newsletter.controller.js";
import { NewsLetterService } from "./newsletter.service.js";

@Module({
  controllers: [NewsLetterController],
  providers: [NewsLetterService, NewsLetterConsumer],
})
export class NewsLetterModule {}
