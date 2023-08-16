import { Module } from "@nestjs/common";
import { NewsLetterController } from "./newsletter.controller";
import { NewsLetterService } from "./newsletter.service";

@Module({
  controllers: [NewsLetterController],
  providers: [NewsLetterService],
})
export class NewsLetterModule {}
