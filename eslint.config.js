const rubiin = require("@rubiin/eslint-config").default;

module.exports = rubiin({
  stylistic: {
    semi: true,
    quotes: "double",
  }, // enable stylistic rules
  yaml: true, // enable yaml rules,
  jsonc: true, // enable jsonc rules
  markdown: true, // enable markdown rules
  gitignore: true, // enable gitignore rules,
  overrides: {
    typescript:
    {
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
});