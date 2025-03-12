# Linting & formatting

- [Languages](#languages)
- [Scripts](#scripts)
    - [Terminal](#terminal)
    - [Pre-commit](#pre-commit)
    - [Editor](#editor)
- [Configuration](#configuration)
- [FAQ](#faq)

This project uses Typescript oxlint to catch errors and avoid bike-shedding by enforcing a common code
style.

## Languages

- **TypeScript** is linted and formatted by Typescript oxlint.

## Scripts

There are a few different contexts in which the linters run.

### Terminal

```bash
# Lint all files without auto-fixing
npm run  lint
```

```bash
# Lint all files, fixing many violations automatically
npm run lint:fix
```

See `package.json` to update.

### Pre-commit

Staged files are automatically linted and tested before each commit. See `lint-staged` on package.json to update.

### Editor

In supported editors, all files will be linted and show under the linter errors section.

## Configuration

This boilerplate ships with opinionated defaults, but you can edit each tools configuration in the following config
files:

- [Oxlint](https://oxc.rs/docs/guide/usage/linter/config.html)
    - `.oxlintrc.json`

Note: This uses oxlint flat config, which is the recommended way to configure oxlint.

## FAQ

**So many configuration files! Why not move more of this to `package.json`?**

- Moving all possible configs to `package.json` can make it _really_ packed, so that quickly navigating to a specific
  config becomes difficult.
- When split out into their own file, many tools provide the option of exporting a config from JS. I do this wherever
  possible, because dynamic configurations are simply more powerful, able to respond to environment variables and much
  more.

The linting rules can be found at [oxlint rules](https://oxc.rs/docs/guide/usage/linter/rules.html) which
has more than 100 powerful rules that help prevent bugs and enforce conventions.
