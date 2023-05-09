import { ApiProperty } from "@nestjs/swagger";

export class Meta {
	@ApiProperty()
	nextCursor: string;

	@ApiProperty()
	hasNextPage: boolean;

	@ApiProperty()
	hasPreviousPage: boolean;
}

export class Paginated<T> {
	@ApiProperty({ isArray: true })
	data: T[];

	@ApiProperty({ type: () => Meta })
	meta: Meta;
}
