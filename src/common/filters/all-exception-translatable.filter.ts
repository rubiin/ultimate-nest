import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException } from "@nestjs/common";
import { I18nKey, t } from "@nestjs/i18n";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<NestifyResponse>();
    const statusCode = exception.getStatus();

    const { key, args } = exception.getResponse() as {
      key: I18nKey;
      args: Record<string, any>;
    };

    response.status(statusCode).json({ message: t(key, { args }), statusCode });
  }
}
