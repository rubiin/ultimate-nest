import {ValidationError, ValidationPipe as OriginalValidationPipe,} from "@nestjs/common";
import {iterate} from "iterare";

export class ValidationPipe extends OriginalValidationPipe {
    protected flattenValidationErrors(validationErrors: ValidationError[]) {
        return iterate(validationErrors)
            .map(error => this.mapChildrenToValidationErrors(error))
            .flatten()
            .filter(item => !!item.constraints)
            .map(item => ({
                errors: Object.values(item.constraints || {}),
                field: (item as any).field || item.property,
            }))
            .filter(errorObject => errorObject.errors.length > 0)
            .flatten()
            .toArray() as unknown as string[];
    }

    protected prependConstraintsWithParentProp(
        parentPath: string,
        error: ValidationError,
    ): ValidationError {
        return {
            field: `${parentPath}.${error.property}`,
            ...super.prependConstraintsWithParentProp(parentPath, error),
        } as unknown as ValidationError;
    }
}
