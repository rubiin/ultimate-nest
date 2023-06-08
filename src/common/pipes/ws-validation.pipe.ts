import { Injectable, ValidationError, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsValidationPipe extends ValidationPipe {
	constructor(options?: ValidationPipeOptions) {
		super({
			exceptionFactory: (errors: Array<ValidationError>): WsException =>
				new WsException(errors),
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			forbidUnknownValues: true,
			...options,
		});
	}
}
