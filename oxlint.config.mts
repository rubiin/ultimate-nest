import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["import", "typescript", "unicorn", "oxc", "vitest", "node"],
  ignorePatterns: [
    // Emitted by `nest build -b swc --type-check`: a serialised dump of the
    // @nestjs/swagger CLI plugin metadata. Machine-generated, never hand-edited.
    "src/metadata.ts",
    "**/typings",
  ],
  env: {
    node: true,
  },
  globals: {
    foo: "readonly",
  },
  settings: {
    vitest: {
      typecheck: true,
    },
  },
  rules: {
    "unicorn/prefer-top-level-await": "off",
    "no-unsafe-assignment": "off",
    "no-unsafe-call": "off",
    "strict-boolean-expressions": "off",
    "no-floating-promises": ["error", { ignoreIIFE: true }],
    "no-misused-promises": ["error", { checksVoidReturn: false }],
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.test.ts", "*.spec.ts"],
      rules: {
        "no-explicit-any": "off",
      },
    },
  ],
});
