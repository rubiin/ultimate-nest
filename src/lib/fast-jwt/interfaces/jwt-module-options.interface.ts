import { ModuleMetadata, Type } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export enum FastJwtSecretRequestType {
  SIGN,
  VERIFY
}

export interface FastJwtModuleOptions {
  global?: boolean;
  signOptions?: jwt.SignOptions;
  secret?: string | Buffer;
  publicKey?: string | Buffer;
  privateKey?: jwt.Secret;
  /**
   * @deprecated
   */
  secretOrPrivateKey?: jwt.Secret;
  secretOrKeyProvider?: (
    requestType: FastJwtSecretRequestType,
    tokenOrPayload: string | object | Buffer,
    options?: jwt.VerifyOptions | jwt.SignOptions
  ) => jwt.Secret;
  verifyOptions?: jwt.VerifyOptions;
}

export interface FastJwtOptionsFactory {
  createJwtOptions(): Promise<FastJwtModuleOptions> | FastJwtModuleOptions;
}

export interface FastJwtModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  useExisting?: Type<FastJwtOptionsFactory>;
  useClass?: Type<FastJwtOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<FastJwtModuleOptions> | FastJwtModuleOptions;
  inject?: any[];
}

export interface FastJwtSignOptions extends jwt.SignOptions {
  secret?: string | Buffer;
  privateKey?: jwt.Secret;
}

export interface FastJwtVerifyOptions extends jwt.VerifyOptions {
  secret?: string | Buffer;
  publicKey?: string | Buffer;
}
