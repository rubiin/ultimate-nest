# SWC builds

SWC ([Speedy Web Compiler](https://swc.rs)) replaces `tsc` for transpiling. It is configured in `.swcrc`
and driven through the Nest CLI's SWC builder, per the [official recipe](https://docs.nestjs.com/recipes/swc).

## Scripts

| Command          | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm build`     | `nest build` (tsc). Full type check. **This is the type gate.**   |
| `pnpm build:swc` | SWC transpile + a tsc declaration pass. No type check.            |
| `pnpm start:swc` | `pnpm build:swc && node dist/main`                                |
| `pnpm start:dev` | `nest start --watch` (tsc). Unchanged, and still the dev default. |

`build` and `build:swc` both write to `dist/`, so they are interchangeable at runtime — only the
guarantees differ.

## Measured on this repo

Averages of three runs each, on an idle machine:

| Command                              | Time    |
| ------------------------------------ | ------- |
| `pnpm build` (tsc)                   | ~30.0 s |
| `pnpm build:swc`                     | ~26.5 s |
| `nest build -b swc` (transpile only) | ~1.4 s  |
| `nest build -b swc --type-check`     | ~30.7 s |

**SWC transpiles ~20x faster, but the end-to-end saving is only ~12%.** The declaration pass below
costs ~25 s and is not optional here, so it dominates. If the ORM constraint in the next section
ever goes away, `nest build -b swc` alone is the real number.

`--type-check` runs the full type checker, so it costs the same as plain tsc and defeats the point.
That is why the type gate stays on `pnpm build` and `build:swc` does not type check.

## Why `build:swc` still shells out to tsc

```
nest build -b swc
tsc -p tsconfig.build.json --declaration --emitDeclarationOnly --incremental false
```

Three things in that second command are load-bearing:

- **Declarations are mandatory here.** The entities use MikroORM's legacy decorators and rely on
  TypeScript types (`Rel<Ref<Post>>`, `Collection<Post>`) to name their relations, resolved by
  `TsMorphMetadataProvider`. At runtime that provider maps each compiled entity back to its `.ts`
  source _through the emitted `.d.ts`_. SWC emits no declarations, so a SWC-only build boots and
  then dies with `Source file './dist/common/database/base.entity.ts' not found`.
- **`tsconfig.build.json`, not `tsconfig.json`.** The default config includes `**/*spec.ts`, and the
  specs do not type check on their own. `nest build` already uses the build config; the declaration
  pass has to match it or it fails on ~130 spec errors and emits nothing.
- **`--incremental false`.** The shared base tsconfig sets `incremental: true`. On a stale
  `.tsbuildinfo` the pass reports success and emits **zero** files, silently. Turning it off makes
  it deterministic.

`incremental: true` was also a live bug for `pnpm build` itself: TypeScript wrote
`tsconfig.build.tsbuildinfo` next to the config file rather than into `outDir`, so `nest build`'s
`deleteOutDir` wiped `dist/` while the cache survived — the second consecutive build emitted nothing
and left a `dist/` with no JavaScript in it. `tsconfig.build.json` now pins
`tsBuildInfoFile` to `./dist/.tsbuildinfo`, which is cleaned with the output. If you ever see a
build succeed with an empty `dist/`, check for a stray `tsconfig.build.tsbuildinfo` in the repo root.

## Trade-offs

**The `@nestjs/swagger` CLI plugin does not run under SWC.** `nest-cli.json` enables it with
`introspectComments: true`, and it emits `_OPENAPI_METADATA_FACTORY` into the compiled output. The
tsc build produces that; the SWC build does not. The Swagger document still generates — schemas
backed by explicit `@ApiProperty` decorators are unaffected — but properties that relied on the
plugin inferring their type from the TypeScript signature lose that metadata, and JSDoc comments no
longer become descriptions.

`nest build -b swc --type-check` does run the plugins, but it emits no loadable metadata file and
costs as much as plain tsc, so it is not a workaround. Keeping `pnpm build` as the documented build
is the cheapest way to keep the full Swagger schema.

**SWC does not type check.** Anything that ships from a `build:swc` artifact should have passed
`pnpm build` in CI first.

**Watch mode stays on tsc.** `nest start -b swc --watch` cannot work here: the watch builder clears
`dist/` on start, taking the declarations with it, and the ORM discovery above fails on the next
rebuild. Use `pnpm start:dev` for development.
