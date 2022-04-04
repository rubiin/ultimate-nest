module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
		createDefaultProgram: true,
	},
	ignorePatterns: ['/*.*'],
	plugins: [
		'@typescript-eslint/eslint-plugin',
		'prettier',
		'unicorn',
		'import',
		'no-secrets',
	],
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/errors',
		'plugin:import/typescript',
		'plugin:unicorn/recommended',
		'prettier',
	],
	root: true,
	env: {
		node: true,
		jest: true,
		es6: true,
		browser: true,
	},
	rules: {
		'import/no-unresolved': [
			2,
			{
				ignore: ['@', 'minifaker'],
			},
		],
		'unicorn/filename-case': 'off',
		'no-secrets/no-secrets': 'error',
		'import/prefer-default': 'off',
		'import/prefer-node-protocol': 'off',
		'unicorn/prevent-abbreviations': 'off',
		'unicorn/no-null': 'off',
		'unicorn/import-style': 'off',
		'unicorn/prefer-module': 'off',
		'unicorn/prefer-node-protocol': 'off',
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
