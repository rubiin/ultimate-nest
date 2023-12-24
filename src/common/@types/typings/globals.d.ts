import type {User as UserEntity} from "@entities";
import type { I18nTranslations as I18nTranslationTypes } from "@generated";
import type { Config as ConfigInterface } from "@lib/config/config.interface";
import type { NextFunction, Request, Response } from "express";

/* The `export {};` statement is used to indicate that the file is a module and exports nothing. It is
often used in TypeScript files that only contain type declarations or interfaces, without any actual
code or exports. This statement ensures that the file is treated as a module and not as a script. */
export {};

declare global {
  namespace Express {
    export interface Request {
      realIp?: string
      idx?: string
      ip: string
      i18nLang?: string
      ips: string[]

    }
    interface User extends UserEntity {

    }
  }

  export type I18nTranslations = I18nTranslationTypes;
  export type Configs = ConfigInterface;

  // Using this allows is to quickly switch between express and fastify and others
  export type NestifyRequest = Request;
  export type NestifyResponse = Response;
  export type NestifyNextFunction = NextFunction;

}
