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
  typescript: {
    tsconfigPath: "tsconfig.json"
    },
  overrides: {
    test: {
      "ts/unbound-method": "off"
    },
    typescript:
    {
      "ts/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],
      "deprecation/deprecation": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-null": "off",
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
