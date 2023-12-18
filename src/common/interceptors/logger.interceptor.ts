import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);
  private userPrefix = "";

  /**
   *  Prefix setter
   * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
   * @param prefix - prefix to be added to the log
   */
  setUserPrefix(prefix: string) {
    this.userPrefix = `${prefix} - `;
  }

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param call$ implements the handle method that returns an Observable
   * @returns Observable of unknown type
   */
  intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<NestifyRequest>();
    const { method, url, headers } = request;
    const body = request.body as Record<string, unknown>;
    const logContext = `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`;
    const message = `Request - ${method} - ${url}`;

    this.logger.log(
      {
        message,
        method,
        body,
        headers,
      },
      logContext,
    );

    return call$.handle().pipe(
      tap({
        next: (value: unknown) => {
          this.logNext(value, context);
        },
        error: (error: Error) => {
          this.logError(error, context);
        },
      }),
    );
  }

  /**
   * Logs the request response in success cases
   * @param body body returned
   * @param context details about the current request
   */
  private logNext(body: unknown, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestifyRequest>();
    const response = context.switchToHttp().getResponse<NestifyResponse>();
    const { method, url } = request;
    const { statusCode } = response;
    const logContext = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
    const message = `Response - ${statusCode} - ${method} - ${url}`;

    this.logger.log(
      {
        message,
        body,
      },
      logContext,
    );
  }

  /**
   * Logs the request response in success cases
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<NestifyRequest>();
    const { method, url } = request;
    const body = request.body as Record<string, unknown>;

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      const logContext = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
      const message = `Response - ${statusCode} - ${method} - ${url}`;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          {
            method,
            url,
            body,
            message,
            error,
          },
          error.stack,
          logContext,
        );
      }
      else {
        this.logger.warn(
          {
            method,
            url,
            error,
            body,
            message,
          },
          logContext,
        );
      }
    }
    else {
      this.logger.error(
        {
          message: `Response - ${method} - ${url}`,
        },
        error.stack,
                `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`,
      );
    }
  }
}
