import { randProductDescription } from "@ngneat/falso";
import { Factory } from "@mikro-orm/seeder";
import { Message } from "@entities";

/* `MessageFactory` is a factory that creates `Message` instances */
export class MessageFactory extends Factory<Message> {
  model = Message;

  definition(): Partial<Message> {
    return {
      body: randProductDescription(),
    };
  }
}
