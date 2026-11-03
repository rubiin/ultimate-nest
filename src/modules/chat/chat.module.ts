import { WsJwtGuard } from "@common/guards/index.js";
import { NestJwtModule } from "@lib/index.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { Module } from "@nestjs/common";

import { ChatController } from "./chat.controller.js";
import { ChatGateway } from "./chat.gateway.js";
import { ChatService } from "./chat.service.js";
import { SocketConnectionService } from "./socket-connection.service.js";

@Module({
  controllers: [ChatController],
  imports: [NestJwtModule, AuthModule],
  providers: [ChatGateway, ChatService, WsJwtGuard, SocketConnectionService],
})
export class ChatModule {}
