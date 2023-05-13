import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import DOMPurify from "isomorphic-dompurify";
import { Observable } from "rxjs";

export class RequestSanitizerInterceptor implements NestInterceptor {
	private except: Array<any> = ["password", "captcha"];

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		this.cleanRequest(context.switchToHttp().getRequest());

		return next.handle();
	}

	cleanRequest(request: Request): void {
		request.query = this.cleanObject(request.query);
		request.params = this.cleanObject(request.params);

		// we wont be sending body on GET and DELETE requests

		if (!["GET", "DELETE"].includes(request.method)) {
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
			if (typeof value === "object") {
				this.cleanObject(value);
			} else {
				// If the value is not an object then it's a scalar
				// so we just let it be transformed.
				object[key] = this.transform(key, value);
			}
		}

		return object;
	}

	/**
	 * It takes a key and a value, and if the value is a string and the key is not in the except array, it
	 * returns the value after it has been sanitized
	 * @param key - The key of the object
	 * @param {string} value - The value to be sanitized.
	 * @returns The value of the key is being returned.
	 */
	transform<T>(key: T, value: string): string {
		if (this.isString(value) && !this.except.includes(key)) {
			return DOMPurify.sanitize(value.trim());
		}

		return value;
	}

	/**
	 * "If the value is a string or a String object, return true, otherwise return false."
	 *
	 * The above function is a type guard. It narrows the type of the value parameter from unknown to
	 * string
	 * @param {unknown} value - The value to check.
	 * @returns A boolean value.
	 */
	isString(value: unknown): value is string {
		return typeof value === "string" || value instanceof String;
	}
}
