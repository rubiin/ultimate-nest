import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Transform input to number. default is 0.
 */
const TransformToNumber = () => Transform(v => (Number.isNaN(+v) ? 0 : +v));

export class PaginationDto {
	@ApiPropertyOptional({ default: 10, description: 'Limit query data' })
	@Min(0)
	@Max(100)
	@Transform(x => x || 1) // Prevented from query limit in mongodb, .limit(0) will return all from db
	@TransformToNumber() // Don't remove, look the comment above
	readonly limit: number = 10;

	@ApiPropertyOptional({ default: 0, description: 'Page query data' })
	@Min(1)
	@TransformToNumber()
	readonly page: number = 1;

	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	readonly q?: string;

	get offset() {
		return this.limit * (this.page - 1);
	}
}
