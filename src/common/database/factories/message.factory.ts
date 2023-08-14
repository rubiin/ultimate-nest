import type { Faker } from '@mikro-orm/seeder';
import { Factory } from '@mikro-orm/seeder';
import { Message } from '@entities';

/* `MessageFactory` is a factory that creates `Message` instances */
export class MessageFactory extends Factory<Message> {
  model = Message;

  definition(faker: Faker): Partial<Message> {
    return {
      body: faker.commerce.productDescription(),
    };
  }
}
