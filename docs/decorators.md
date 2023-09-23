# Available decorators

Most decorators are combination of multiple decorators to make code more lesser

## Validation decorators

| Decorator                                        | Description                                                                           |
|--------------------------------------------------|---------------------------------------------------------------------------------------|
| `@MinMaxLength(options?:IsMinMaxLengthOptions)`  | Checks if value is has supplied minlength and maxlength                               |
| `@IsNumberField(options?:IsNumberFieldOptions)`  | Checks if given value is number, is required and has supplied min and max value       |
| `@IsStringField(options?: IsStringFieldOptions)` | Checks if given value is string, is required and has supplied minlength and maxlength |
| `@IsEnumField(options?: IsEnumFieldOptions)`     | Checks if value is an enum and is required                                            |
| `@IsAfterDateField(value)`                       | Checks if given date is after the passed date                                         |
| `@IsDateInFormat(format)`                        | Checks if date string is in provided date format                                      |
| `@IsEqualToField(value)`                         | Checks if value is in equal to the passed value                                       |
| `@IsGreaterThan(values)`                         | Checks if value is greater than the passed number value                               |
| `@IsPasswordField()`                             | Checks if value is a valid password                                                   |
| `@IsUsernameField()`                             | Checks if value is a valid username                                                   |
| `@IsProfane()`                                   | Checks if value has curse words                                                       |
| `@IsUnique()`                                    | Checks if value is unique. Queries database to do so.                                 |
| `@UUIDParam(value)`                              | Checks if passed param is a valid uuid v4                                             |

# Other decorators

Most decorators are combination of multiple decorators to make code more lesser

| Decorator                                    | Description                                                                                                                                               |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@Public()`                                  | Adding this to a controller method marks that controller as public and wont require any credentials for usage                                             |
| `@LoggedInUser()`                            | Use this to retrieve current logged in user                                                                                                               |
| `@Auth()`                                    | Applies Jwt guard and casl guard along with swagger decoartores for auth. Using this on a controller or controller method makes them protected with `jwt` |
| `@NoCache()`                                 | This decorator is used to mark a controller (`GET`) to be not cached by global caching                                                                    |
| `@ApiFile(opts?: IApiFile)`                  | Use this decorator to set correct swagger definition for your route if it contains file.                                                                  |
| `@ApiPaginatedResponse(entity,descriptions)` | use this decorator for swagger definition for a paginated list                                                                                            |
| `@Trim()`                                    | Trims the value/values if used in dto                                                                                                                     |
| `@Sanitize()`                                | Sanitizes the value/values if used in dto . Uses `dompurify` for sanitization                                                                             |
