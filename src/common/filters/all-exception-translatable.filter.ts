import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<NestifyResponse>();
    const statusCode = exception.getStatus();

    let message = exception.getResponse() as {
      key: string
      args: Record<string, any>
    };

    message = I18nContext.current()!.t(message.key, {
      lang: host.switchToHttp().getRequest<NestifyRequest>().i18nLang,
      args: message.args,
    });

    response.status(statusCode).json({ statusCode, message });
  }
}
