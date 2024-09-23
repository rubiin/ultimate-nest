const rubiin = require("@antfu/eslint-config").default;

module.exports = rubiin({
  stylistic: {
    semi: false,
    quotes: "double",
  }, // enable stylistic rules
  yaml: true, // enable yaml rules,
  jsonc: true, // enable jsonc rules
  markdown: false, // enable markdown rules
  gitignore: true, // enable gitignore rules,
  typescript: {
    tsconfigPath: "tsconfig.json"
    },
  overrides: {
    test: {
      "ts/unbound-method": "off",
      "ts/no-unsafe-assignment": "off",
      "ts/no-unsafe-call": "off",
    },
    typescript:
    {
      "ts/no-unsafe-assignment": "off",
      "ts/no-unsafe-call": "off",
      "ts/strict-boolean-expressions":"off",
      "ts/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],
      "ts/no-floating-promises":["error",{
        "ignoreIIFE": true
      }],
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
