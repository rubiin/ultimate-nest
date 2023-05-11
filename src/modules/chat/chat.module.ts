import { WsJwtGuard } from "@common/guards";
import { NestJwtModule } from "@lib/index";
import { AuthModule } from "@modules/auth";
import { Module } from "@nestjs/common";

import { ChatController,ChatGateway, ChatService, SocketConnectionService } from "./index";

@Module({
	imports: [NestJwtModule, AuthModule],
	providers: [ChatGateway, ChatService, WsJwtGuard, SocketConnectionService],
	controllers: [ChatController],
})
export class ChatModule {}
