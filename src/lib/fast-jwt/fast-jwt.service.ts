import { Inject, Injectable, Optional } from "@nestjs/common";
import * as jwt from "fast-jwt";

import { MODULE_OPTIONS_TOKEN } from "./fast-jwt.module-definition";
import { FastJwtModuleOptions, JwtSignOptions, JwtVerifyOptions } from "./fast-jwt.options";

@Injectable()
export class FastJwtService {
	constructor(
		@Optional()
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: FastJwtModuleOptions = {},
	) {}

	sign(payload: string | Buffer | object, options?: JwtSignOptions): string {
		const signOptions = this.mergeJwtOptions(
			{ ...options },
			"signOptions",
		) as jwt.SignerOptions;
		const secret = this.getSecretKey();
		const signer = jwt.createSigner({ key: secret, ...signOptions });

		return signer(payload);
	}

	signAsync(payload: string | Buffer | object, options?: JwtSignOptions): Promise<string> {
		const signOptions = this.mergeJwtOptions(
			{ ...options },
			"signOptions",
		) as jwt.SignerOptions;
		const secret = this.getSecretKey();

		const signWithPromise = jwt.createSigner({ key: async () => secret, ...signOptions });
		return signWithPromise(payload);
	}

	private mergeJwtOptions(
		options: jwt.SignerOptions | jwt.VerifierOptions,
		key: "verifyOptions" | "signOptions",
	): jwt.SignerOptions | jwt.VerifierOptions {
		return options
			? {
					...(this.options[key] || {}),
					...options,
			  }
			: this.options[key];
	}

	verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T {
		const verifyOptions = this.mergeJwtOptions({ ...options }, "verifyOptions");
		const secret = this.getSecretKey();

		const verifySync = jwt.createVerifier({ key: secret, ...verifyOptions });

		return verifySync(token) as T;
	}

	verifyAsync<T extends object = any>(token: string, options?: JwtVerifyOptions): Promise<T> {
		const verifyOptions = this.mergeJwtOptions({ ...options }, "verifyOptions");
		const secret = this.getSecretKey();

		const verifyWithPromise = jwt.createVerifier({ key: async () => secret, ...verifyOptions });
		return verifyWithPromise(token) as Promise<T>;
	}

	private getSecretKey() {
		return this.options.secret;
	}
}
