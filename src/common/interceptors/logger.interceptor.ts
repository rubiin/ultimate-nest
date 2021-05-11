import {
	CallHandler,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly ctxPrefix: string = LoggingInterceptor.name;
	private readonly logger: Logger = new Logger(this.ctxPrefix);
	private userPrefix = '';

	/**
	 *  Prefix setter
	 * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
	 */
	setUserPrefix(prefix: string): void {
		this.userPrefix = `${prefix} - `;
	}

	/**
	 * Intercept method, logs before and after the request being processed
	 * @param context details about the current request
	 * @param call$ implements the handle method that returns an Observable
	 */
	intercept(
		context: ExecutionContext,
		call$: CallHandler,
	): Observable<unknown> {
		const request: Request = context.switchToHttp().getRequest();
		const { method, url, body, headers } = request;
		const context_ = `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`;
		const message = `Request - ${method} - ${url}`;

		this.logger.log(
			{
				message,
				method,
				body,
				headers,
			},
			context_,
		);

		return call$.handle().pipe(
			tap({
				next: (value: unknown): void => {
					this.logNext(value, context);
				},
				error: (error: Error): void => {
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
	private logNext(body: unknown, context: ExecutionContext): void {
		const request: Request = context.switchToHttp().getRequest<Request>();
		const res: Response = context.switchToHttp().getResponse<Response>();
		const { method, url } = request;
		const { statusCode } = res;
		const context_ = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
		const message = `Response - ${statusCode} - ${method} - ${url}`;

		this.logger.log(
			{
				message,
				body,
			},
			context_,
		);
	}

	/**
	 * Logs the request response in success cases
	 * @param error Error object
	 * @param context details about the current request
	 */
	private logError(error: Error, context: ExecutionContext): void {
		const request: Request = context.switchToHttp().getRequest<Request>();
		const { method, url, body } = request;

		if (error instanceof HttpException) {
			const statusCode: number = error.getStatus();
			const context_ = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
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
					context_,
				);
			} else {
				this.logger.warn(
					{
						method,
						url,
						error,
						body,
						message,
					},
					context_,
				);
			}
		} else {
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
