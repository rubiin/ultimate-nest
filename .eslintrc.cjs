// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  ignorePatterns: ['migrations', 'src/generated', '**/*.spec.ts', '**/*.e2e.ts'], // optimize this
  extends: ['@rubiin/eslint-config-typescript'],
  root: true,
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'unicorn/prefer-module': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    'no-useless-constructor': 'off', // optimize this
    '@typescript-eslint/require-await': 'off', // optimize this
    '@typescript-eslint/no-unsafe-assignment': 'off', // optimize this
    '@typescript-eslint/no-unsafe-member-access': 'off', // optimize this
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        ignore: [
          '\\.e2e*',
          '\\.spec*',
          '\\.decorator*',
          '\\*idx*',
        ],
        allowList: {
          ProcessEnv: true,
          UUIDParam: true,
        },
      },
    ],
  },
})
