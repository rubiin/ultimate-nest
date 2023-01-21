# Available decorators



## Validation decorators

| Decorator                                              | Description                                                                                                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@MinMaxLength(ops?:IsMinMaxLengthOptions)`                               | Checks if value is has supplied minlength and maxlength
| `@IsNumberField(ops?:IsNumberFieldOptions)`                                        | Checks if given value is number, is required and has supplied min and max value
| `@IsStringField(ops?: IsStringFieldOptions)`                             | Checks if given value is string, is required and has supplied minlength and maxlength                                                                                                                                                         |
|  `@IsEnumField(ops?: IsEnumFieldOptions)`                       | Checks if value is an enum and  is required                                                                                                                                                         |
| `@IsAfter(value)`                                           | Checks if given date is after the passed date                                                                        |
| `@IsDateInFormat(format)`                                        | Checks if date string is in provided date format                                                                 |
| `@IsEqualTo(value)`                                 | Checks if value is in equal to the passed value                                                                                                                                                |
| `@IsGreaterThan(values)`                              | Checks if value is greater than the passed number value                                                                                                                                           |
| `@IsPassword()`                              | Checks if value is a valid password                                                                                                                                      |
| `@IsUsername()`                              | Checks if value is a valid username                                                                                                                                  |
| `@IsProfane()`                              | Checks if value has curse words                                                                                                                                |
| `@IsUnique()`                              | Checks if value is unique.                                                                                                                                                                                       |
| `@IsPositive()`                                        | Checks if the value is a positive number greater than zero.                                                                                                                                           |
| `@IsNegative()`                                        | Checks if the value is a negative number smaller than zero.                                                                                                                                           |
| `@Min(min: number)`                                    | Checks if the given number is greater than or equal to given number.                                                                                                                                  |
| `@Max(max: number)`                                    | Checks if the given number is less than or equal to given number.                                                                                                                                     |
