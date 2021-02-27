import {
	NestInterceptor,
	ExecutionContext,
	Injectable,
	CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ExitInterceptor implements NestInterceptor {
	public intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> {
		return next
			.handle()
			.pipe(
				catchError(e => {
					return throwError(e);
				}),
			)
			.pipe(
				map(data => {
					return { data };
				}),
			);
	}
}
