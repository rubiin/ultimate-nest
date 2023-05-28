import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  FastJwtModuleOptions,
  FastJwtSecretRequestType,
  FastJwtSignOptions,
  FastJwtVerifyOptions
} from './interfaces';
import { FAST_JWT_MODULE_OPTIONS } from './jwt.constants';

@Injectable()
export class FastJwtService {
  private readonly logger = new Logger('JwtService');

  constructor(
    @Optional()
    @Inject(FAST_JWT_MODULE_OPTIONS)
    private readonly options: FastJwtModuleOptions = {}
  ) {}

  sign(payload: string | Buffer | object, options?: FastJwtSignOptions): string {
    const signOptions = this.mergeJwtOptions(
      { ...options },
      'signOptions'
    ) as jwt.SignOptions;
    const secret = this.getSecretKey(
      payload,
      options,
      'privateKey',
      FastJwtSecretRequestType.SIGN
    );

    return jwt.sign(payload, secret, signOptions);
  }

  signAsync(
    payload: string | Buffer | object,
    options?: FastJwtSignOptions
  ): Promise<string> {
    const signOptions = this.mergeJwtOptions(
      { ...options },
      'signOptions'
    ) as jwt.SignOptions;
    const secret = this.getSecretKey(
      payload,
      options,
      'privateKey',
      FastJwtSecretRequestType.SIGN
    );

    return new Promise((resolve, reject) =>
      jwt.sign(payload, secret, signOptions, (err, encoded) =>
        err ? reject(err) : resolve(encoded)
      )
    );
  }

  verify<T extends object = any>(token: string, options?: FastJwtVerifyOptions): T {
    const verifyOptions = this.mergeJwtOptions({ ...options }, 'verifyOptions');
    const secret = this.getSecretKey(
      token,
      options,
      'publicKey',
      FastJwtSecretRequestType.VERIFY
    );

    return jwt.verify(token, secret, verifyOptions) as T;
  }

  verifyAsync<T extends object = any>(
    token: string,
    options?: FastJwtVerifyOptions
  ): Promise<T> {
    const verifyOptions = this.mergeJwtOptions({ ...options }, 'verifyOptions');
    const secret = this.getSecretKey(
      token,
      options,
      'publicKey',
      FastJwtSecretRequestType.VERIFY
    );

    return new Promise((resolve, reject) =>
      jwt.verify(token, secret, verifyOptions, (err, decoded) =>
        err ? reject(err) : resolve(decoded as T)
      )
    ) as Promise<T>;
  }

  decode(
    token: string,
    options?: jwt.DecodeOptions
  ): null | { [key: string]: any } | string {
    return jwt.decode(token, options);
  }

  private mergeJwtOptions(
    options: FastJwtVerifyOptions | FastJwtSignOptions,
    key: 'verifyOptions' | 'signOptions'
  ): jwt.VerifyOptions | jwt.SignOptions {
    delete options.secret;
    if (key === 'signOptions') {
      delete (options as FastJwtSignOptions).privateKey;
    } else {
      delete (options as FastJwtVerifyOptions).publicKey;
    }
    return options
      ? {
          ...(this.options[key] || {}),
          ...options
        }
      : this.options[key];
  }

  private getSecretKey(
    token: string | object | Buffer,
    options: FastJwtVerifyOptions | FastJwtSignOptions,
    key: 'publicKey' | 'privateKey',
    secretRequestType: FastJwtSecretRequestType
  ): string | Buffer | jwt.Secret {
    let secret = this.options.secretOrKeyProvider
      ? this.options.secretOrKeyProvider(secretRequestType, token, options)
      : options?.secret ||
        this.options.secret ||
        (key === 'privateKey'
          ? (options as FastJwtSignOptions)?.privateKey || this.options.privateKey
          : (options as FastJwtVerifyOptions)?.publicKey ||
            this.options.publicKey) ||
        this.options[key];

    if (this.options.secretOrPrivateKey) {
      this.logger.warn(
        `"secretOrPrivateKey" has been deprecated, please use the new explicit "secret" or use "secretOrKeyProvider" or "privateKey"/"publicKey" exclusively.`
      );
      secret = this.options.secretOrPrivateKey;
    }
    return secret;
  }
}
