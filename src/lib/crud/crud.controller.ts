import { ICrud, PaginationRequest, PaginationResponse } from "@common/@types";
import { BaseEntity } from "@common/database";
import { LoggedInUser, SwaggerResponse } from "@common/decorators";
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
import { ApiBody, ApiCreatedResponse } from "@nestjs/swagger";
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
	Q extends PaginationRequest,
	C extends RequiredEntityData<T>,
	U extends EntityData<T>,
>(queryDto: Type<Q>,createDto: Type<C>, updateDto: Type<U>): Type<ICrud<T, Q, C, U>> {
	const createPipe = new AbstractValidationPipe(AppUtils.validationPipeOptions(), {
		body: createDto,
	});
	const updatePipe = new AbstractValidationPipe(AppUtils.validationPipeOptions(), {
		body: updateDto,
	});

	const queryPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { query: queryDto });


	class CrudController<
		T extends BaseEntity,
		Q extends PaginationRequest,
		C extends RequiredEntityData<T>,
		U extends EntityData<T>,
	> implements ICrud<T, Q, C, U>
	{
		protected service: ICrud<T, Q, C, U>;

		@Get(":idx")
		@SwaggerResponse({
			operation: "Find item",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		findOne(@Param("idx") index: string): Observable<T> {
			return this.service.findOne(index);
		}

		@UsePipes(queryPipe)
		@Get()
		findAll(@Query() query: Q): Observable<PaginationResponse<T>> {
			return this.service.findAll(query);
		}

		@SwaggerResponse({
			operation: "Create item",
			badRequest: "Item already exists.",
		})
		@UsePipes(createPipe)
		@ApiBody({ type: createDto })
		@ApiCreatedResponse({
			description: "Created successfully.",
			type: createDto,
		})
		@Post()
		create(@Body() body: C, @LoggedInUser() user?: User): Observable<T> {
			return this.service.create(body, user);
		}

		@SwaggerResponse({
			operation: "Item update",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		@UsePipes(updatePipe)
		@ApiBody({ type: createDto })
		@ApiCreatedResponse({
			description: "Updated successfully.",
			type: createDto,
		})
		@Put(":idx")
		update(@Param("idx") index: string, @Body() body: U): Observable<T> {
			return this.service.update(index, body);
		}

		@SwaggerResponse({
			operation: "Item delete",
			badRequest: "Item does not exist.",
			params: ["idx"],
		})
		@ApiCreatedResponse({
			description: "Deleted successfully.",
			type: createDto,
		})
		@Delete(":idx")
		remove(@Param("idx") index: string): Observable<T> {
			return this.service.remove(index);
		}
	}

	return CrudController;
}
