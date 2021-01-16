import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import validator from 'validator';

export class RequestSanitizerInterceptor implements NestInterceptor {
	private except = ['password', 'captcha'];

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		this.cleanRequest(context.switchToHttp().getRequest());

		return next.handle();
	}

	cleanRequest(req: any): void {
		req.query = this.cleanObject(req.query);
		req.params = this.cleanObject(req.params);

		// we wont be sending body on GET and POST

		if (req.method !== 'GET' || req.method !== 'DELETE') {
			req.body = this.cleanObject(req.body);
		}
	}

	cleanObject(obj: Record<string, any> | null | undefined) {
		if (!obj) {
			return obj;
		}

		for (const key in obj) {
			const value = obj[key];

			// If the value is another nested object we need to recursively
			// clean it too. This will work for both array and object.
			if (typeof value === 'object') {
				this.cleanObject(value);
			} else {
				// If the value is not an object then it's a scalar
				// so we just let it be transformed.
				obj[key] = this.transform(key, value);
			}
		}

		return obj;
	}

	transform(key: string | number, value: any) {
		if (
			this.isString(value) &&
			this.isString(key) &&
			this.except.find(el => el.includes(key))
		) {
			return validator.trim(escape(value));
		}

		return value;
	}

	isString(value: any): value is string {
		return typeof value === 'string' || value instanceof String;
	}
}
