import { Module } from "@nestjs/common";

import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
	providers: [ChatGateway, ChatService],
})
export class ChatModule {}
