import { ApiProperty } from "@nestjs/swagger";

export class Meta {
	@ApiProperty()
	endCursor: string;

	@ApiProperty()
	startCursor: string;

	@ApiProperty()
	hasNextPage: boolean;

	@ApiProperty()
	hasPreviousPage: boolean;
}

export class Edge<T> {
	@ApiProperty()
	cursor: string;

	@ApiProperty()
	node: T;
}

export class Paginated<T> {
	@ApiProperty()
	previousCount: number;

	@ApiProperty()
	currentCount: number;

	@ApiProperty({ isArray: true, type: () => Edge })
	edges: Edge<T>[];

	@ApiProperty({ type: () => Meta })
	meta: Meta;
}
