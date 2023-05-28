import { FastJwtModuleOptions } from './interfaces/jwt-module-options.interface';
import { FAST_JWT_MODULE_OPTIONS } from './jwt.constants';

export function createJwtProvider(options: FastJwtModuleOptions): any[] {
  return [{ provide: FAST_JWT_MODULE_OPTIONS, useValue: options || {} }];
}
