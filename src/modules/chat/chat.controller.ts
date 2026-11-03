import { GenericController, LoggedInUser } from "@common/decorators/index.js";
import { User } from "@entities";
import { Get } from "@nestjs/common";

import { ChatService } from "./chat.service.js";

@GenericController("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getConversationForUser(@LoggedInUser() user: User) {
    return this.chatService.getConversationForUser(user);
  }
}
