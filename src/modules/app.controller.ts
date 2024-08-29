import { Controller, Get, InternalServerErrorException } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("ping")
  ping(): "pong" {
    throw new InternalServerErrorException("oh fish")
  }
}
