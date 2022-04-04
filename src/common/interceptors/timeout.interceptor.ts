import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
	intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			timeout(5000),
			catchError(error => {
				if (error instanceof TimeoutError) {
					return throwError(new RequestTimeoutException());
				}

				return throwError(error);
			}),
		);
	}
}
