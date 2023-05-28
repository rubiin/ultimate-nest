import * as jwt from "fast-jwt";

type Secret = string | Buffer | jwt.KeyFetcher;

export interface FastJwtModuleOptions {
	global?: boolean;
	secret?: string | Buffer;
	signOptions?: jwt.SignerOptions;
	verifyOptions?: jwt.VerifierOptions;
}

export interface JwtSignOptions extends jwt.SignerOptions {
	secret?: Secret;
}

export interface JwtVerifyOptions extends jwt.VerifierOptions {
	secret?: Secret;
}
