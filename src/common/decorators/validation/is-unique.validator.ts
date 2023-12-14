import { EntityManager } from "@mikro-orm/postgresql";
import type { Type } from "@nestjs/common";
import type {
  ValidationArguments as BaseValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import {
  ValidatorConstraint,
  registerDecorator,
} from "class-validator";

export interface ValidationArguments<
    Constraints extends unknown[] = [],
    CustomObject extends object = object,
> extends BaseValidationArguments {
  object: CustomObject
  constraints: Constraints
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

export function IsUnique<Entity>(entityType: () => Type<Entity>, field: keyof Entity, options?: ValidationOptions) {
  return ({ constructor: target }: object, propertyName: string) => registerDecorator({
    constraints: [entityType, field],
    target,
    options,
    propertyName,
    validator: IsUniqueConstraint,
  });
}
