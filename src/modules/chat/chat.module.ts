import { Module } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module";
import { NestJwtModule } from "@lib/index";
import { WsJwtGuard } from "@common/guards";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { SocketConnectionService } from "./socket-connection.service";

@Module({
  imports: [NestJwtModule, AuthModule],
  providers: [ChatGateway, ChatService, WsJwtGuard, SocketConnectionService],
  controllers: [ChatController],
})
export class ChatModule {}
