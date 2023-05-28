import { Inject, Injectable, Optional } from "@nestjs/common";
import * as jwt from "fast-jwt";

import { parse } from "@lukeed/ms";
import { MODULE_OPTIONS_TOKEN } from "./fast-jwt.module-definition";
import { FastJwtModuleOptions, JwtSignOptions, JwtVerifierOptions } from "./fast-jwt.options";

@Injectable()
export class FastJwtService {
	constructor(
		@Optional()
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: FastJwtModuleOptions = {},
	) {}

	sign(payload: string | Buffer | object, options?: JwtSignOptions): string {
		const signOptions = this.mergeJwtOptions(
			{ ...this.convertTemporalProps(options) },
			"signerOptions",
		) as jwt.SignerOptions;
		const secret = this.getSecretKey();
		const signer = jwt.createSigner({ key: secret, ...signOptions });

		return signer(payload);
	}

	signAsync(payload: string | Buffer | object, options?: JwtSignOptions): Promise<string> {
		const signOptions = this.mergeJwtOptions(
			{ ...this.convertTemporalProps(options) },
			"signerOptions",
		) as jwt.SignerOptions;

		console.log(signOptions);
		const secret = this.getSecretKey();

		const signWithPromise = jwt.createSigner({ key: async () => secret, ...signOptions });
		return signWithPromise(payload);
	}

	verify<T extends object = any>(token: string, options?: JwtVerifierOptions): T {
		const verifyOptions = this.mergeJwtOptions(
			{ ...this.convertTemporalProps(options, true) },
			"verifierOptions",
		);
		const secret = this.getSecretKey();

		const verifySync = jwt.createVerifier({ key: secret, ...verifyOptions });

		return verifySync(token) as T;
	}

	verifyAsync<T extends object = any>(token: string, options?: JwtVerifierOptions): Promise<T> {
		const verifyOptions = this.mergeJwtOptions(
			{ ...this.convertTemporalProps(options, true) },
			"verifierOptions",
		);
		const secret = this.getSecretKey();

		const verifyWithPromise = jwt.createVerifier({ key: async () => secret, ...verifyOptions });
		return verifyWithPromise(token) as Promise<T>;
	}

	private mergeJwtOptions(
		options: JwtSignOptions | JwtVerifierOptions,
		key: "verifierOptions" | "signerOptions",
	): JwtSignOptions | JwtVerifierOptions {
		return options
			? {
					...(this.options[key] || {}),
					...options,
			  }
			: this.options[key];
	}

	convertToMs(time: string | number) {
		// by default if time is number we assume that they are seconds - see README.md
		if (typeof time === "number") {
			return time * 1000;
		}
		return parse(time);
	}

	convertTemporalProps(options: any, isVerifyOptions = false) {
		if (!options || typeof options === "function") {
			return options;
		}

		const formatedOptions = Object.assign({}, options);

		if (isVerifyOptions && formatedOptions.maxAge) {
			formatedOptions.maxAge = this.convertToMs(formatedOptions.maxAge);
		} else if (formatedOptions.expiresIn || formatedOptions.notBefore) {
			if (formatedOptions.expiresIn) {
				formatedOptions.expiresIn = this.convertToMs(formatedOptions.expiresIn);
			}

			if (formatedOptions.notBefore) {
				formatedOptions.notBefore = this.convertToMs(formatedOptions.notBefore);
			}
		}

		return formatedOptions;
	}

	private getSecretKey() {
		return this.options.secret;
	}
}
