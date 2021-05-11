import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ExitInterceptor implements NestInterceptor {
	intercept(
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
