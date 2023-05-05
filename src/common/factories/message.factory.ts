import { Message } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";

/* `MessageFactory` is a factory that creates `Message` instances */
export class MessageFactory extends Factory<Message> {
	model = Message;

	definition(faker: Faker): Partial<Message> {
		return {
			body: faker.commerce.productDescription(),
		};
	}
}
