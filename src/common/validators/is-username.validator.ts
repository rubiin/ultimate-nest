/**
 *
 * Rules used:
 *
 * Only contains alphanumeric characters, underscore and dot.
 *
 * Underscore and dot can't be at the end or start of a username (e.g _username / username_ / .username / username.).
 *
 * Underscore and dot can't be next to each other (e.g user_.name).
 *
 * Underscore or dot can't be used multiple times in a row (e.g user__name / user..name).
 *
 * Number of characters must be between 6 to 20.
 *
 *
 * Tests at https://regex101.com/r/m5AT6j/1
 */

import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({async: true})
class IsUsernameConstraint implements ValidatorConstraintInterface {
    async validate(value: string, _argument: ValidationArguments) {
        return /^[A-Za-z][\w.]{5,12}/.test(value);
    }

    defaultMessage(argument: ValidationArguments) {
        const property = argument.property;

        return `${property} must fulfill username's criteria`;
    }
}

export function IsUsername(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUsernameConstraint,
        });
    };
}
