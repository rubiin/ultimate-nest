import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class ExitInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: Error) => {
        return throwError(() => error);
      }),
      map((data: unknown) => data),
    );
  }
}
