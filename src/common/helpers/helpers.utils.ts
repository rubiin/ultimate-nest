import {RandomTypes} from "@common/constants/misc.enum";
import {IAuthenticationPayload} from "@common/interfaces/authentication.interface";
import {hashString} from "@common/misc/threads";
import {User} from "@entities";
import {verify} from "argon2";
import * as eta from "eta";
import {pick, slugify} from "helper-fns";
import {customAlphabet} from "nanoid/async";
import {from, Observable} from "rxjs";
import sharp from "sharp";

export const HelperService = {
    /**
     *
     *
     * @param {*} op
     * @param {...any[]} args
     * @return {*}  {*}
     */
    makeTask: (op: any, ...arguments_: any[]): any => {
        return {op, args: arguments_};
    },

    /**
     *
     *
     * @param {Record<string,any>} obj
     * @return {*}
     */
    dispatcher: (object: Record<string, any>) => {
        return async ({op, args}) => {
            return await object[op](...args);
        };
    },

    /* A function that returns an object. */
    buildPayloadResponse: (
        user: User,
        accessToken: string,
        refreshToken?: string,
    ): IAuthenticationPayload => {
        return {
            user: {
                ...pick(user, ["id", "idx", "email"]),
            },
            payload: {
                access_token: accessToken,
                ...(refreshToken ? {refresh_token: refreshToken} : {}),
            },
        };
    },

    /* A function that returns a promise that resolves to a string. */
    hashString: (string: string): Promise<string> => {
        return hashString(string);
    },

    /* A function that returns an observable that resolves to a boolean. */
    verifyHash: (
        userPassword: string,
        passwordToCompare: string,
    ): Observable<boolean> => {
        return from(verify(userPassword, passwordToCompare));
    },

    /* Rendering a template. */
    renderTemplate: (data: unknown, path: string): void | Promise<string> => {
        return eta.renderFileAsync(
            path,
            {data},
            {cache: true, rmWhitespace: true},
        );
    },

    /* Generating a thumbnail from a buffer. */
    generateThumb: (
        input: Buffer,
        config: { height: number; width: number },
    ): Promise<Buffer> => {
        return sharp(input).resize(config).toFormat("png").toBuffer();
    },

    /* A function that returns a promise that resolves to a random number or string. */
    getRandom: (
        type: RandomTypes,
        length: number,
        alphabet?: string,
    ): Promise<number | string> => {
        if (alphabet) {
            return customAlphabet(alphabet, length)();
        }

        return customAlphabet(
            type === RandomTypes.NUMBER
                ? "1234567890"
                : // eslint-disable-next-line no-secrets/no-secrets
                "abcdefghijklmnopqrstuvwxyz",
            length,
        )();
    },

    /* Converting an enum to a string. */
    enumToString: (value: Record<string, any>): string[] => {
        const length = Object.keys(value).length;

        return Object.keys(value).splice(length / 2, length);
    },

    /* Generating a slug from a string. */
    generateSlug: (value: string): string => {
        return slugify(value);
    },
};
