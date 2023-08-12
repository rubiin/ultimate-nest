// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
	},
	ignorePatterns: ["migrations", "src/generated"],
	extends: ["rubiin"],
	root: true,
	settings: {
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: "./tsconfig.json",
			},
		},
	},
});
