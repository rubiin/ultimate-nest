import { WsJwtGuard } from "@common/guards";
import { NestJwtModule } from "@lib/index";
import { AuthModule } from "@modules/auth/auth.module";
import { Module } from "@nestjs/common";

import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { SocketConnectionService } from "./socket-connection.service";

@Module({
	imports: [NestJwtModule, AuthModule],
	providers: [ChatGateway, ChatService, WsJwtGuard, SocketConnectionService],
})
export class ChatModule {}
