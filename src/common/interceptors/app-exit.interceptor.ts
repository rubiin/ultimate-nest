import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class ExitInterceptor implements NestInterceptor {
	intercept(_context: ExecutionContext, next: CallHandler<any>): Observable<any> {
		return next
			.handle()
			.pipe(
				catchError(error => {
					return throwError(() => error);
				}),
			)
			.pipe(
				map(data => {
					return { data };
				}),
			);
	}
}
