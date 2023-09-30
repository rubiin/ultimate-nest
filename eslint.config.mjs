import rubiin from "@rubiin/eslint-config";

export default rubiin({
  stylistic: true, // enable stylistic rules
  yaml: true, // enable yaml rules,
  jsonc : true, // enable jsonc rules
  markdown: true, // enable markdown rules
  typescript: {
    tsconfigPath: "tsconfig.json", // path to tsconfig.json
  },
},
{
  rules: {
    "ts/no-floating-promises": "off",
    "ts/no-extraneous-class": "off",
    "ts/unbound-method": "off",
    "ts/require-await": "off", // optimize this
    "ts/no-unsafe-assignment": "off", // optimize this
    "ts/no-unsafe-member-access": "off", // optimize this
    "unicorn/prefer-top-level-await": "off",
    "ts/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
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
