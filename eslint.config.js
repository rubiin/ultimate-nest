const rubiin = require('@rubiin/eslint-config').default

module.exports = rubiin({
  stylistic: {
    semi: true,
  }, // enable stylistic rules
  yaml: true, // enable yaml rules,
  jsonc : true, // enable jsonc rules
  markdown: true, // enable markdown rules
  gitignore: true, // enable gitignore rules,
},
{
  files: ['**/*.ts'],
  rules: {
    "ts/no-floating-promises": "off",
    "ts/no-extraneous-class": "off",
    "ts/unbound-method": "off",
    "ts/require-await": "off", // optimize this
    "ts/no-unsafe-assignment": "off", // optimize this
    "ts/no-unsafe-member-access": "off", // optimize this
    "unicorn/prefer-top-level-await": "off",
    "unicorn/prevent-abbreviations": [
      "error",
      {
        ignore: [
          "\\.e2e*",
          "\\.spec*",
          "\\.decorator*",
          "\\*idx*",
        ],
        allowList: {
          ProcessEnv: true,
          UUIDParam: true,
        },
      },
    ],
  },
},
);
