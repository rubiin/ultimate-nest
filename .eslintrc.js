module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
	},
	ignorePatterns: ['/*.*'],
	plugins: [
		'@typescript-eslint/eslint-plugin',
		'prettier',
		'unicorn',
		'import',
	],
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'prettier/@typescript-eslint',
		'plugin:import/errors',
		'plugin:import/typescript',
		'plugin:unicorn/recommended',
		'plugin:prettier/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
		es6: true,
		browser: true,
	},
	rules: {
		'import/no-unresolved': [2, { ignore: ['@'] }],
		'import/prefer-default': 'off',
		'unicorn/prevent-abbreviations': 'off',
		'unicorn/no-null': 'off',
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
			'single',
			{
				allowTemplateLiterals: true,
				avoidEscape: true,
			},
		],
		'no-console': [
			'error',
			{
				allow: ['warn', 'error', 'info'],
			},
		],
	},
};
