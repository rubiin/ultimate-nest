import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import validator from 'validator';

export class RequestSanitizerInterceptor implements NestInterceptor {
	private except = ['password', 'captcha'];

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		this.cleanRequest(context.switchToHttp().getRequest());

		return next.handle();
	}

	cleanRequest(request: any): void {
		request.query = this.cleanObject(request.query);
		request.params = this.cleanObject(request.params);

		// we wont be sending body on GET and POST

		if (request.method !== 'GET' || request.method !== 'DELETE') {
			request.body = this.cleanObject(request.body);
		}
	}

	cleanObject(object: Record<string, any> | null | undefined) {
		if (!object) {
			return object;
		}

		for (const key in object) {
			const value = object[key];

			// If the value is another nested object we need to recursively
			// clean it too. This will work for both array and object.
			if (typeof value === 'object') {
				this.cleanObject(value);
			} else {
				// If the value is not an object then it's a scalar
				// so we just let it be transformed.
				object[key] = this.transform(key, value);
			}
		}

		return object;
	}

	transform(key: string | number, value: any) {
		if (
			this.isString(value) &&
			this.isString(key) &&
			!this.except.some(element => element.includes(key))
		) {
			return validator.trim(escape(value));
		}

		return value;
	}

	isString(value: any): value is string {
		return typeof value === 'string' || value instanceof String;
	}
}
