<p align='center'><img width="300px" style="display:block; margin:0 auto;" src="https://i.imgur.com/qWH4gup.png" alt="Vitely - Vue3 + Vite template starter">
</p>

[![CI](https://github.com/rubiin/vitely/actions/workflows/sample.yml/badge.svg)](https://github.com/rubiin/vitely/actions/workflows/sample.yml)

# Vitely 🌬 ⛵️

> A simple opinionated Vue3 Starter Template with [Vite.js](https://vitejs.dev/)

Fork of vitesome with more goodies.
This template should help get you started developing with Vue 3 and Typescript in Vite in a bliss.

## Features

<br>

## Features

- ⚡️ [Vue 3](https://github.com/vuejs/vue-next), [Vite 2](https://github.com/vitejs/vite),[ESBuild](https://github.com/evanw/esbuild) - born with fastness

- 📦 [Components auto importing](./src/components)

- 🍍 [State Management via Pinia](https://pinia.esm.dev/)

- 📑 [Layout system](./src/layouts)

- 📲 [PWA](https://github.com/antfu/vite-plugin-pwa)

- 🎨 [Uno CSS](https://github.com/antfu/unocss) - The instant on-demand Atomic CSS engine.

- 😃 [Use icons from any icon sets, with no compromise](https://github.com/antfu/unocss/blob/main/packages/preset-icons/README.md)

- 🌍 [I18n ready](./locales)

- 🔥 Use the [new `<script setup>` syntax](https://github.com/vuejs/rfcs/pull/227)

- 🔧 PostCSS with autoprefixer

- 📥 [APIs auto importing](https://github.com/antfu/unplugin-auto-import) - directly use Vue Composition API and others without importing

- 🦾 TypeScript, of course

- ⚙️ E2E Testing with [Cypress](https://cypress.io/) on [GitHub Actions](https://github.com/features/actions)

- ☁️ Deploy on Netlify, zero-config

<br>

<p align='center'><a href="https://vitely.vercel.app"> Live Demo</a><p>

## Pre-📦

This repo brings few things pre-packed, so you don't need to install them manually everytime.

### Styling

- [Uno CSS](https://github.com/antfu/unocss) with [`vite-plugin-windicss`](https://github.com/antfu/unocss)
- PostCss with plugins support
- Default [Google Fonts](https://github.com/stafyniaksacha/vite-plugin-fonts#readme) with `vite-plugin-fonts`

### Icons

- `uno-iconify` Use any icon pack of your liking
- Custom icons below `./assets/icons` with

### Plugins

- [`@vueuse/head`](https://github.com/vueuse/head) - manipulate document head reactively
- [`unplugin-vue-components`](https://github.com/antfu/unplugin-vue-components) - components auto import
- [`unplugin-auto-import`](https://github.com/antfu/unplugin-auto-import) - Directly use Vue Composition API and others without importing
- [`vite-plugin-compress`](https://github.com/alloc/vite-plugin-compress) - Compress your bundle + assets from Vite
- [`vite-plugin-vue-i18n`](https://github.com/intlify/vite-plugin-vue-i18n) - Vite plugin for Vue I18n
- [`vite-plugin-pwa`](https://github.com/antfu/vite-plugin-pwa) - PWA
- [`rollup-plugin-visualizer`](https://github.com/antfu/vite-plugin-pwa) - visualize and analyze your bundle to see which modules are taking up space.
- [`@rollup/plugin-strip`](https://github.com/antfu/vite-plugin-pwa) - remove debugger statements and functions like assert.equal and console.log from your code
- [Vue I18n](https://github.com/intlify/vue-i18n-next) - Internationalization
- [Vue Router](https://github.com/vuejs/vue-router)
- [Pinia](https://pinia.esm.dev) - Intuitive, type safe, light and flexible Store for Vue using the composition api
- [VueUse](https://github.com/antfu/vueuse) - collection of useful composition APIs

### Coding Style

- Use Composition API with [`<script setup>` SFC syntax](https://github.com/vuejs/rfcs/pull/227)
- [ESLint](https://eslint.org/) with [@antfu/eslint-config](https://github.com/antfu/eslint-config), single quotes, no sem

```
yarn
```

### Use it

```
yarn dev
```

This will serve the app at [http://localhost:4000](http://localhost:4000)

### Build it

```
yarn build
```

Builds the app for production to the `dist` folder.<br>
It correctly bundles Vue in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](#deployment) for more information.

### Deployment

Visit [Netlify](https://app.netlify.com/start) and select your repo, select OK along the way, and your App will be live in a minute.
Visit [Vercel](https://vercel) and select your repo, select OK along the way, and your App will be live in a minute.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur). Make sure to enable `vetur.experimental.templateInterpolationService` in settings!

### If Using `<script setup>`

[`<script setup>`](https://github.com/vuejs/rfcs/pull/227) is a feature that is currently in RFC stage. To get proper IDE support for the syntax, use [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) instead of Vetur (and disable Vetur).

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can use the following:

### If Using Vetur

1. Install and add `@vuedx/typescript-plugin-vue` to the [plugins section](https://www.typescriptlang.org/tsconfig#plugins) in `tsconfig.json`
2. Delete `src/shims-vue.d.ts` as it is no longer needed to provide module info to Typescript
3. Open `src/main.ts` in VSCode
4. Open the VSCode command palette
5. Search and run "Select TypeScript version" -> "Use workspace version"

![repository-banner.png](https://res.cloudinary.com/alvarosaburido/image/upload/v1612193118/as-portfolio/Repo_Banner_kexozw.png)
