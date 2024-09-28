import type { User } from "@entities"
import type { ChatService } from "./chat.service"
import { GenericController, LoggedInUser } from "@common/decorators"
import { Get } from "@nestjs/common"

@GenericController("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getConversationForUser(@LoggedInUser() user: User) {
    return this.chatService.getConversationForUser(user)
  }
}
