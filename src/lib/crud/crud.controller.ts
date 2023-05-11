import { ICrud } from "@common/@types";
import { PaginationClass } from "@common/@types/pagination.class";
import { BaseEntity } from "@common/database";
import { LoggedInUser, SwaggerResponse } from "@common/decorators";
import { SearchDto } from "@common/dtos/search.dto";
import { AppUtils } from "@common/helpers";
import { User } from "@entities";
import { EntityData, RequiredEntityData } from "@mikro-orm/core";
import {
	ArgumentMetadata,
	Body,
	Delete,
	Get,
	Injectable,
	Param,
	Post,
	Put,
	Query,
	Type,
	UsePipes,
	ValidationPipe,
	ValidationPipeOptions,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
	constructor(
		options: ValidationPipeOptions,
		private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
	) {
		super(options);
	}

	async transform(value: any, metadata: ArgumentMetadata) {
		const targetType = this.targetTypes[metadata.type];

		if (!targetType) {
			return super.transform(value, metadata);
		}

		return super.transform(value, { ...metadata, metatype: targetType });
	}
}

export function ControllerFactory<
	T extends BaseEntity,
	C extends RequiredEntityData<T>,
	U extends EntityData<T>,
>(createDto: Type<C>, updateDto: Type<U>): Type<ICrud<T, C, U>> {
	const createPipe = new AbstractValidationPipe(AppUtils.validationPipeOptions(), {
		body: createDto,
	});
	const updatePipe = new AbstractValidationPipe(AppUtils.validationPipeOptions(), {
		body: updateDto,
	});

	class CrudController<
		T extends BaseEntity,
		C extends RequiredEntityData<T>,
		U extends EntityData<T>,
	> implements ICrud<T, C, U>
	{
		protected service: ICrud<T, C, U>;

		@Get(":idx")
		@SwaggerResponse({
			operation: "Find item",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		findOne(@Param("idx") index: string): Observable<T> {
			return this.service.findOne(index);
		}

		@Get()
		findAll(@Query() query: SearchDto): Observable<PaginationClass<T>> {
			return this.service.findAll(query);
		}

		@SwaggerResponse({
			operation: "Create item",
			badRequest: "Item already exists.",
		})
		@Post()
		@UsePipes(createPipe)
		create(@Body() body: C, @LoggedInUser() user?: User): Observable<T> {
			return this.service.create(body, user);
		}

		@SwaggerResponse({
			operation: "Item update",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		@Put(":idx")
		@UsePipes(updatePipe)
		update(@Param("idx") index: string, @Body() body: U): Observable<T> {
			return this.service.update(index, body);
		}

		@SwaggerResponse({
			operation: "Item delete",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		@Delete(":idx")
		remove(@Param("idx") index: string): Observable<T> {
			return this.service.remove(index);
		}
	}

	return CrudController;
}
