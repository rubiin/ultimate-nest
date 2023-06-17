// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "createDefaultProgram": false,
        "project": "tsconfig.json",
        "sourceType": "module",
        "tsconfigRootDir": __dirname,
    },
    "ignorePatterns": ["migrations", "src/generated"],
    "plugins": [
        "import",
        "@typescript-eslint/eslint-plugin",
        "unicorn",
        "simple-import-sort",
        "deprecation"
    ],
    "extends": [
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:import/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:unicorn/recommended"
    ],
    "root": true,
    "settings": {
        "import/resolver": {
            "typescript": {
                "alwaysTryTypes": true,
                "project": "./tsconfig.json"
            }
        },
    },
    "env": {
        "node": true,
        "jest": true,
        "es6": true,
        "browser": false,
    },
    "rules": {
        "deprecation/deprecation": "warn",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "no-param-reassign": "error",
        "unicorn/filename-case": "error",
        "@typescript-eslint/no-non-null-assertion": "off",
        "unicorn/no-process-exit": "off",
        "no-array-constructor": "error",
        "no-mixed-operators": "error",
        "import/default": "off",
        "@typescript-eslint/no-var-requires": "off",
        "no-plusplus": [
            "error",
            {"allowForLoopAfterthoughts": true}
        ],
        "import/prefer-default": "off",
        "unicorn/prevent-abbreviations": [
            "error",
            {
                "ignore": [
                    "\\.e2e*",
                    "\\.spec*",
                    "\\.decorator*",
                    "\\*idx*",
                ],
                "allowList": {
                    "ProcessEnv": true,
                    "UUIDParam": true,
                }
            }
        ],
        "import/namespace": "off",
        "unicorn/no-null": "off",
        "unicorn/import-style": "error",
        "unicorn/prefer-module": "off",
        "unicorn/prefer-top-level-await": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {"argsIgnorePattern": "^_"},
        ],
        "no-multi-spaces": "error",
        "linebreak-style": ["error", "unix"],
        "newline-before-return": "error",
        "no-await-in-loop": "error",
        "padding-line-between-statements": [
            "error",
            {
                "blankLine": "always",
                "prev": ["const", "let", "var"],
                "next": "*",
            },
            {
                "blankLine": "any",
                "prev": ["const", "let", "var"],
                "next": ["const", "let", "var"],
            },
        ],
        "prefer-const": [
            "error",
            {
                "destructuring": "any",
                "ignoreReadBeforeAssign": false,
            },
        ],
        "quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true,
                "avoidEscape": true,
            },
        ],
        "no-unused-vars": ["error", {"varsIgnorePattern": "^_", "ignoreRestSiblings": true, "argsIgnorePattern": "^_"}],
        "no-console": [
            "error",
            {
                "allow": ["warn", "error", "info", "table"],
            },
        ],
    }
});
