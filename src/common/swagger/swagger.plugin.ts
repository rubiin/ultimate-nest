/**
 * The `CaseInsensitiveFilterPlugin` function returns an object with a `fn` property that contains an
 * `opsFilter` method, which filters an array of tagged operations based on a case-insensitive phrase.
 * @returns An object with a `fn` property that contains an `opsFilter` method.
 */
function CaseInsensitiveFilterPlugin() {
  return {
    fn: {
      opsFilter: (
        taggedOps: { filter: (argument: (_tagObject: unknown, tag: string) => boolean) => any },
        phrase: string,
      ) => {
        return taggedOps.filter((_tagObject: unknown, tag: string): boolean =>
          tag.toLowerCase().includes(phrase.toLowerCase()),
        ) as unknown as { filter: (argument: (_tagObject: unknown, tag: string) => boolean) => any };
      },
    },
  };
}

/* The `swaggerOptions` object is being exported as a constant. It contains various configuration
options for a Swagger API documentation. */
export const swaggerOptions = {
  docExpansion: "list",
  filter: true,
  showRequestDuration: true,
  tryItOutEnabled: true,
  displayOperationId: true,
  persistAuthorization: true,
  plugins: [CaseInsensitiveFilterPlugin],
  operationsSorter: (
    a: { get: (argument: string) => string },
    b: { get: (argument: string) => string },
  ) => {
    const methodsOrder = ["get", "post", "put", "patch", "delete", "options", "trace"];
    let result = methodsOrder.indexOf(a.get("method")) - methodsOrder.indexOf(b.get("method"));

    if (result === 0)
      result = a.get("path").localeCompare(b.get("path"));

    return result;
  },
};
