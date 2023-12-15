import { randMovie } from "@ngneat/falso";
import { Factory } from "@mikro-orm/seeder";
import { Conversation } from "@entities";

/* `ConversationFactory` is a factory that creates `Conversation` instances */
export class ConversationFactory extends Factory<Conversation> {
  model = Conversation;

  definition(): Partial<Conversation> {
    return {
      chatName: randMovie(),
    };
  }
}
