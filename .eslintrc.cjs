// @ts-check
const process = require('node:process')
const { defineConfig } = require('eslint-define-config')

process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = defineConfig({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  ignorePatterns: ['migrations', 'src/generated'],
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
