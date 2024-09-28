import { Message } from "@entities"
import { Factory } from "@mikro-orm/seeder"
import { randProductDescription } from "@ngneat/falso"

/* `MessageFactory` is a factory that creates `Message` instances */
export class MessageFactory extends Factory<Message> {
  model = Message

  definition(): Partial<Message> {
    return {
      body: randProductDescription(),
    }
  }
}
