import { OffsetPaginationDto } from "@common/dtos/offset-pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

import { PaginationAbstractResponse } from "./interfaces";

export class OffsetMeta {
	@ApiProperty()
	readonly page: number;

	@ApiProperty()
	readonly limit: number;

	@ApiProperty()
	readonly itemCount: number;

	@ApiProperty()
	readonly pageCount: number;

	@ApiProperty()
	readonly hasPreviousPage: boolean;

	@ApiProperty()
	readonly hasNextPage: boolean;

	constructor({
		pageOptionsDto,
		itemCount,
	}: {
		pageOptionsDto: OffsetPaginationDto;
		itemCount: number;
	}) {
		this.page = pageOptionsDto.page;
		this.limit = pageOptionsDto.limit;
		this.itemCount = itemCount;
		this.pageCount = Math.ceil(this.itemCount / this.limit);
		this.hasPreviousPage = this.page > 1;
		this.hasNextPage = this.page < this.pageCount;
	}
}

export class OffsetPaginationResponse<T> implements PaginationAbstractResponse<T, OffsetMeta> {
	@IsArray()
	@ApiProperty({ isArray: true })
	readonly data: T[];

	@ApiProperty({ type: () => OffsetMeta })
	readonly meta: OffsetMeta;

	constructor(data: T[], meta: OffsetMeta) {
		this.data = data;
		this.meta = meta;
	}
}
