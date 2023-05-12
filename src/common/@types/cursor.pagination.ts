import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

import { PaginationAbstractResponse } from "./interfaces";

export class CursorMeta {
	@ApiProperty()
	nextCursor: string;

	@ApiProperty()
	hasNextPage: boolean;

	@ApiProperty()
	hasPreviousPage: boolean;

	@ApiProperty()
	search?: string;
}

export class CursorPaginationResponse<T> implements PaginationAbstractResponse<T, CursorMeta> {
	@IsArray()
	@ApiProperty({ isArray: true })
	readonly data: T[];

	@ApiProperty({ type: () => CursorMeta })
	readonly meta: CursorMeta;
}
