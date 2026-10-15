/**
 * The `CaseInsensitiveFilterPlugin` function returns an object with a `fn` property that contains an
 * `opsFilter` method, which filters an array of tagged operations based on a case-insensitive phrase.
 * @returns An object with a `fn` property that contains an `opsFilter` method.
 */
interface TaggedOps {
  filter: (argument: (_tagObject: unknown, tag: string) => boolean) => TaggedOps;
}

function CaseInsensitiveFilterPlugin() {
  return {
    fn: {
      opsFilter: (taggedOps: TaggedOps, phrase: string): TaggedOps => {
        return taggedOps.filter((_tagObject: unknown, tag: string): boolean =>
          tag.toLowerCase().includes(phrase.toLowerCase()),
        );
      },
    },
  };
}

/* The `swaggerOptions` object is being exported as a constant. It contains various configuration
options for a Swagger API documentation. */
export const swaggerOptions = {
  displayOperationId: true,
  docExpansion: "list",
  filter: true,
  operationsSorter: (
    a: { get: (argument: string) => string },
    b: { get: (argument: string) => string },
  ) => {
    const methodsOrder = ["get", "post", "put", "patch", "delete", "options", "trace"];
    let result = methodsOrder.indexOf(a.get("method")) - methodsOrder.indexOf(b.get("method"));

    if (result === 0) result = a.get("path").localeCompare(b.get("path"));

    return result;
  },
  persistAuthorization: true,
  plugins: [CaseInsensitiveFilterPlugin],
  showRequestDuration: true,
  tryItOutEnabled: true,
};
