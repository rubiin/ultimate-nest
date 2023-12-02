import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import {
  Injectable,
  RequestTimeoutException,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { TimeoutError, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError((error: Error) => {
        if (error instanceof TimeoutError)
          return throwError(() => new RequestTimeoutException());

        return throwError(() => error);
      }),
    );
  }
}
