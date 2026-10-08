import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolves the path aliases declared in tsconfig.json natively (Vite 8).
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: "./",
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 30_000,
  },
});
