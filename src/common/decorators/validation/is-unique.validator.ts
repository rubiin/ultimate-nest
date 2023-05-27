import { EntityManager } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import {
	registerDecorator,
	ValidationArguments as BaseValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

export interface ValidationArguments<
	Constraints extends unknown[] = [],
	Object_ extends object = object,
> extends BaseValidationArguments {
	object: Object_;
	constraints: Constraints;
}

export type IsUniqueValidationContext = ValidationArguments<Parameters<typeof IsUnique>>;

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
	constructor(private em: EntityManager) {}

	async validate<Entity, Field extends keyof Entity>(
		value: Entity[Field],
		context: IsUniqueValidationContext,
	): Promise<boolean> {
		const [entityType, field] = context.constraints;
		const result = await this.em.count(entityType(), { [field]: value });

		return result === 0;
	}

	defaultMessage(context: IsUniqueValidationContext): string {
		return `${context.property} must be unique`;
	}
}

export const IsUnique =
	<Entity>(entityType: () => Type<Entity>, field: keyof Entity, options?: ValidationOptions) =>
	({ constructor: target }: object, propertyName: string) =>
		registerDecorator({
			constraints: [entityType, field],
			target,
			options,
			propertyName,
			validator: IsUniqueConstraint,
		});
