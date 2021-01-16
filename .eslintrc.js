module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Stylistic Issues
    // http://eslint.org/docs/rules/#stylistic-issues
    // ----------------------------------------------
    'array-bracket-newline': 'off', // eslint:recommended
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': 'off', // eslint:recommended
    'block-spacing': ['error', 'never'],
    'brace-style': 'error',
    'camelcase': ['error', { properties: 'never' }],
    // 'capitalized-comments': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    // 'consistent-this': 'off',
    'eol-last': 'error',
    'func-call-spacing': 'error',
    // 'func-name-matching': 'off',
    // 'func-names': 'off',
    // 'func-style': 'off',
    // 'id-blacklist': 'off',
    // 'id-length': 'off',
    // 'id-match': 'off',
    'indent': [
      'error', 2, {
        'CallExpression': {
          'arguments': 2,
        },
        'FunctionDeclaration': {
          'body': 1,
          'parameters': 2,
        },
        'FunctionExpression': {
          'body': 1,
          'parameters': 2,
        },
        'MemberExpression': 2,
        'ObjectExpression': 1,
        'SwitchCase': 1,
        'ignoredNodes': [
          'ConditionalExpression',
        ],
      },
    ],
    // 'jsx-quotes': 'off',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    // 'line-comment-position': 'off',
    'linebreak-style': 'error',
    // 'lines-around-comment': 'off',
    // 'max-depth': 'off',
    'max-len': ['error', {
      code: 80,
      tabWidth: 2,
      ignoreUrls: true,
      ignorePattern: 'goog\.(module|require)',
    }],
    // 'max-lines': 'off',
    // 'max-nested-callbacks': 'off',
    // 'max-params': 'off',
    // 'max-statements': 'off',
    // 'max-statements-per-line': 'off',
    // TODO(philipwalton): add a rule to enforce the operator appearing
    // at the end of the line.
    // 'multiline-ternary': 'off',
    // 'new-parens': 'off',
    // 'newline-per-chained-call': 'off',
    'no-array-constructor': 'error',
    // 'no-bitwise': 'off',
    // 'no-continue': 'off',
    // 'no-inline-comments': 'off',
    // 'no-lonely-if': 'off',
    // 'no-mixed-operators': 'off',
    'no-mixed-spaces-and-tabs': 'error', // eslint:recommended
    // 'no-multi-assign': 'off',
    'no-multiple-empty-lines': ['error', { max: 2 }],
    // 'no-negated-condition': 'off',
    // 'no-nested-ternary': 'off',
    'no-new-object': 'error',
    // 'no-plusplus': 'off',
    // 'no-restricted-syntax': 'off',
    'no-tabs': 'error',
    // 'no-ternary': 'off',
    'no-trailing-spaces': 'error',
    // 'no-underscore-dangle': 'off',
    // 'no-unneeded-ternary': 'off',
    // 'no-whitespace-before-property': 'off',
    // 'nonblock-statement-body-position': 'off',
    // 'object-curly-newline': 'off',
    'object-curly-spacing': 'error',
    // 'object-property-newline': 'off',
    'one-var': ['error', {
      var: 'never',
      let: 'never',
      const: 'never',
    }],
    // 'one-var-declaration-per-line': 'off',
    // 'operator-assignment': 'off',
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    // 'padding-line-between-statements': 'off',
    'quote-props': ['error', 'consistent'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'semi': 'error',
    'semi-spacing': 'error',
    // 'semi-style': 'off',
    // 'sort-keys': 'off',
    // 'sort-vars': 'off',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      asyncArrow: 'always',
      anonymous: 'never',
      named: 'never',
    }],
    // 'space-in-parens': 'off',
    // 'space-infix-ops': 'off',
    // 'space-unary-ops': 'off',
    'spaced-comment': ['error', 'always'],
    'switch-colon-spacing': 'error',
    // 'template-tag-spacing': 'off',
    // 'unicode-bom': 'off',
    // 'wrap-regex': 'off',

    // ECMAScript 6
    // http://eslint.org/docs/rules/#ecmascript-6
    // ------------------------------------------
    // 'arrow-body-style': 'off',
    // TODO(philipwalton): technically arrow parens are optional but
    // recommended. ESLint doesn't support a *consistent* setting so
    // "always" is used.
    'arrow-parens': ['error', 'always'],
    // 'arrow-spacing': 'off',
    'constructor-super': 'error', // eslint:recommended
    'generator-star-spacing': ['error', 'after'],
    // 'no-class-assign': 'off',
    // 'no-confusing-arrow': 'off',
    // 'no-const-assign': 'off', // eslint:recommended
    // 'no-dupe-class-members': 'off', // eslint:recommended
    // 'no-duplicate-imports': 'off',
    'no-new-symbol': 'error', // eslint:recommended
    // 'no-restricted-imports': 'off',
    'no-this-before-super': 'error', // eslint:recommended
    // 'no-useless-computed-key': 'off',
    // 'no-useless-constructor': 'off',
    // 'no-useless-rename': 'off',
    'no-var': 'error',
    // 'object-shorthand': 'off',
    // 'prefer-arrow-callback': 'off',
    'prefer-const': ['error', { destructuring: 'all' }],
    // 'prefer-destructuring': 'off',
    // 'prefer-numeric-literals': 'off',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    // 'prefer-template': 'off',
    // 'require-yield': 'error', // eslint:recommended
    'rest-spread-spacing': 'error',
    // 'sort-imports': 'off',
    // 'symbol-description': 'off',
    // 'template-curly-spacing': 'off',
    'yield-star-spacing': ['error', 'after'],
  },
};
