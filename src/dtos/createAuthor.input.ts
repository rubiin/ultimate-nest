import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateAuthorInput {
	@Field()
	readonly name: string;
	@Field(() => Int)
	readonly age: number;
	@Field()
	readonly username: string;
	@Field({ nullable: true })
	readonly bio?: string;
}
