import type { ValidationPipeOptions } from "@nestjs/common";
import { ValidationError } from "@nestjs/common";
import { Injectable, ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      exceptionFactory: (errors: ValidationError[]): WsException => new WsException(errors),
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
      ...options,
    });
  }
}
