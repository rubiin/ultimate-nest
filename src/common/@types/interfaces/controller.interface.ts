import { SearchDto } from "@common/dtos/search.dto";
import { User } from "@entities";
import { Observable } from "rxjs";

import { PaginationClass } from "../pagination.class";

export interface ICrudController<EntityType, CreateDto, UpdateDto> {
	getOne(index: string): Observable<EntityType>;

	get(query: SearchDto): Observable<PaginationClass<EntityType>>;

	create(body: CreateDto, user?: User): Observable<EntityType>;

	update(index: string, body: UpdateDto): Observable<EntityType>;

	delete(index: string): Observable<Partial<EntityType>>;
}
