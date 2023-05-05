import { Conversation } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

/* `ConversationFactory` is a factory that creates `Conversation` instances */
export class ConversationFactory extends Factory<Conversation> {
	model = Conversation;

	definition(faker: Faker): Partial<Conversation> {
		return {
			chatName: faker.lorem.words(randomNumber(1, 5)),
		};
	}
}
