import { Conversation } from "@entities"
import { Factory } from "@mikro-orm/seeder"
import { randMovie } from "@ngneat/falso"

/* `ConversationFactory` is a factory that creates `Conversation` instances */
export class ConversationFactory extends Factory<Conversation> {
  model = Conversation

  definition(): Partial<Conversation> {
    return {
      chatName: randMovie(),
    }
  }
}
