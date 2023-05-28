import * as jwt from "fast-jwt";

type Secret = string | Buffer | jwt.KeyFetcher;

export type OptionalProps<T> = {
	[P in keyof T]?: T[P];
};

export interface FastJwtModuleOptions {
	global?: boolean;
	secret?: string | Buffer;
	signOptions?: OptionalProps<jwt.SignerOptions>;
	verifyOptions?: OptionalProps<jwt.VerifierOptions>;
}

export interface JwtSignOptions extends OptionalProps<jwt.SignerOptions> {
	secret?: Secret;
}

export interface JwtVerifierOptions extends OptionalProps<jwt.VerifierOptions> {
	secret?: Secret;
}
