import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { User } from "@entities";
import { Pagination } from "@lib/pagination";
import { Observable } from "rxjs";

import { ICommonDto } from "./common.dto.interface";

/**
 * common service interface that enforces common methods
 */
export interface IBaseService<T> {
	create(dto: ICommonDto, user?: User): Promise<T> | Observable<T>;
	findAll(dto: PageOptionsDto): Observable<Pagination<T>>;
	findOne(index: string): Observable<T>;
	update(index: string, dto: ICommonDto): Observable<T>;
	remove(index: string): Observable<T>;
}
