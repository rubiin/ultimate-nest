import { ApiProperty } from "@nestjs/swagger";

export class Meta {
	@ApiProperty()
	nextCursor: string;

	@ApiProperty()
	hasNextPage: boolean;

	@ApiProperty()
	hasPreviousPage: boolean;

	@ApiProperty()
	search?: string;
}

export class PaginationClass<T> {
	@ApiProperty({ isArray: true })
	data: T[];

	@ApiProperty({ type: () => Meta })
	meta: Meta;
}
