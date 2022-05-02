import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";
import { Comment } from "../../../entities/comment.entity";

export class CommentFactory extends Factory<Comment> {
	model = Comment;

	definition(faker: Faker): Partial<Comment> {
		return {
			body: faker.lorem.words(randomNumber(4, 8)),
		};
	}
}
