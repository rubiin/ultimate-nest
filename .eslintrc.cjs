module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		"createDefaultProgram": true,
    "project": "tsconfig.json",
    "sourceType": "module",
    "tsconfigRootDir": __dirname,
	},
	ignorePatterns: ['/*.*'],
	plugins: [
		'@typescript-eslint/eslint-plugin',
		'prettier',
		'unicorn',
		'import',
		'simple-import-sort'
	],
	extends: [
		'plugin:import/typescript',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/recommended',
		'plugin:import/errors',
		'plugin:unicorn/all',
		'prettier',
	],
	root: true,
	settings: {
    "import/resolver": {
      "typescript": {
				"alwaysTryTypes": true,
				"project": './tsconfig.json'

			}
    },
  },
	env: {
		node: true,
		jest: true,
		es6: true,
		browser: false,
	},
	rules: {
		'no-duplicate-imports': 'error',
		'no-param-reassign': 'error',
		'unicorn/filename-case': 'off',
		'no-array-constructor': 'error',
		'no-mixed-operators': 'error',
		'import/default': 'off',
		'no-plusplus': [
			"error",
			{ "allowForLoopAfterthoughts": true }
		],
		'import/prefer-default': 'off',
		'unicorn/prevent-abbreviations': [
			"error",
	{
		"ignore": [
			"\\.e2e*",
			"\\.spec*",
			"\\.decorator*",
			"\\*idx*",
		]
	}
		],
		'import/namespace': 'off',
		"unicorn/prefer-top-level-await": "off",
		'unicorn/no-null': 'off',
		'unicorn/import-style': 'off',
		'unicorn/prefer-module': 'off',
		'unicorn/prefer-node-protocol': 'off',
		"simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_' },
		],
		'no-multi-spaces': 'error',
		'linebreak-style': ['error', 'unix'],
		'newline-before-return': 'error',
		'no-await-in-loop': 'error',
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: ['const', 'let', 'var'],
				next: '*',
			},
			{
				blankLine: 'any',
				prev: ['const', 'let', 'var'],
				next: ['const', 'let', 'var'],
			},
		],
		'prefer-const': [
			'error',
			{
				destructuring: 'any',
				ignoreReadBeforeAssign: false,
			},
		],
		quotes: [
			'error',
			'double',
			{
				allowTemplateLiterals: true,
				avoidEscape: true,
			},
		],
		"no-unused-vars": ["error", { "varsIgnorePattern": "^_","ignoreRestSiblings": true,"argsIgnorePattern": "^_" }],
		'no-console': [
			'error',
			{
				allow: ['warn', 'error', 'info','table'],
			},
		],
	},
};
