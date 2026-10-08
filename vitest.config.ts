import { createRequire } from "node:module";

import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

/**
 * `helper-fns` and `unprofane` ship ESM entry points that reference `module`,
 * `__dirname` and `require` inside their `.mjs` bundles, so they throw when
 * loaded as real ES modules. Both publish working CommonJS builds, and this
 * project compiles to CommonJS, so pin the resolver to the CJS entry points
 * (resolved through the `require` condition).
 */
const cjsEntry = (id: string) => require.resolve(id);

export default defineConfig({
  resolve: {
    // Resolves the path aliases declared in tsconfig.json natively (Vite 8).
    tsconfigPaths: true,
    alias: [
      { find: /^helper-fns$/, replacement: cjsEntry("helper-fns") },
      { find: /^unprofane$/, replacement: cjsEntry("unprofane") },
    ],
  },
  test: {
    globals: true,
    root: "./",
    include: ["src/**/*.spec.ts"],
    testTimeout: 30_000,
    coverage: {
      directory: "./coverage",
      reporter: ["text", "html"],
    },
  },
});
