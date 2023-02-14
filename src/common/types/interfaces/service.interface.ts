import { PageOptionsDto } from "@common/dtos/pagination.dto";
import { User } from "@entities";
import { Pagination } from "@lib/pagination";
import { Observable } from "rxjs";

import { ICommonDto } from "./common.dto.interface";

/**
 * common service interface that enforces common methods
 */
export interface ICommonService<T> {
	create(dto: ICommonDto, user?: User): Promise<T> | Observable<T>;
	findAll(dto: PageOptionsDto): Observable<Pagination<T>>;
	findOne(id: string): Observable<T>;
	update(id: string, dto: ICommonDto): Observable<T>;
	remove(id: string): Observable<T>;
}
