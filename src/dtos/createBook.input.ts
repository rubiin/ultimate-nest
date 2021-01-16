import { Field, InputType, Int } from '@nestjs/graphql';
import { Author } from '../entities/User.entity';

@InputType()
export class CreateBookInput {
	@Field()
	readonly title: string;
	@Field()
	readonly description: string;
	@Field()
	readonly author: Author[];
}
