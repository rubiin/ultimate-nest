import { PageOptionsDto } from "@common/classes/pagination";
import { User } from "@entities";
import { Pagination } from "@lib/pagination";
import { Observable } from "rxjs";

import { CommonDtoInterface } from "./common.dto.interface";

/**
 * common service interface that enforces common methods
 */
export interface CommonServiceInterface<T> {
	create(dto: CommonDtoInterface, user?: User): Promise<T> | Observable<T>;
	findAll(dto: PageOptionsDto): Observable<Pagination<T>>;
	findOne(id: string): Observable<T>;
	update(id: string, dto: CommonDtoInterface): Observable<T>;
	remove(id: string): Observable<T>;
}
