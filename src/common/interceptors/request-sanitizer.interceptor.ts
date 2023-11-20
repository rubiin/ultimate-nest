import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { isObject, isString } from "helper-fns";
import DOMPurify from "isomorphic-dompurify";
import type { Observable } from "rxjs";

export class RequestSanitizerInterceptor implements NestInterceptor {
  private except = ["password", "captcha"];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.cleanRequest(context.switchToHttp().getRequest<NestifyRequest>());

    return next.handle();
  }

  cleanRequest(request: NestifyRequest): void {
    request.query = this.cleanObject(request.query) || {}; // defaulting to an empty object if query is undefined
    request.params = this.cleanObject(request.params) || {}; // defaulting to an empty object if params is undefined

    // we wont be sending body on GET and DELETE requests

    if (!["GET", "DELETE"].includes(request.method))
      request.body = this.cleanObject(request.body);
  }

  cleanObject(object: Record<string, any> | null | undefined) {
    if (!object)
      return object;

    for (const key in object) {
      const value = object[key];

      // If the value is another nested object we need to recursively
      // clean it too. This will work for both array and object.
      if (isObject(value)) {
        this.cleanObject(value);
      }
      else if (isString(value)) {
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
   * @param value - The value to be sanitized.
   * @returns The value of the key is being returned.
   */
  transform(key: string, value: string): string {
    if (isString(value) && !this.except.includes(key))
      return DOMPurify.sanitize(value.trim());

    return value;
  }
}
