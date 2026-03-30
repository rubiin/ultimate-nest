import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("ping")
  ping(): "pong" {
    return "pong";
  }
}
