const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');
const importXPlugin = require('eslint-plugin-import-x');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node
      }
    },

    plugins: {
      'import-x': importXPlugin,
      prettier: prettierPlugin
    },

    rules: {
      // Stylistic rules (previously from airbnb)
      curly: ['error', 'multi-line'],
      'default-case': 'error',
      'no-param-reassign': [
        'error',
        { props: true, ignorePropertyModificationsFor: ['req', 'res', 'ctx', 'err', 'data', 'doc'] }
      ],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-shadow': [
        'error',
        { allow: ['err', 'error', 'cb', 'callback', 'resolve', 'reject', 'next', 'val'] }
      ],
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
      'no-continue': 'off',
      'no-underscore-dangle': 'off',
      radix: 'off',
      'guard-for-in': 'error',
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-multi-spaces': 'error',
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-throw-literal': 'error',
      'no-with': 'error',
      yoda: ['error', 'never'],
      'vars-on-top': 'off',

      // Import rules
      'import-x/no-unresolved': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-amd': 'error',
      'import-x/first': 'error',
      'import-x/exports-last': 'off',
      'import-x/no-namespace': 'off',
      'import-x/no-cycle': 'off',

      'prettier/prettier': 'error',

      'no-console': 'warn',
      'no-undef': 'warn',
      'consistent-return': 'off',
      'func-names': 'off',
      'class-methods-use-this': 'off',

      'prefer-destructuring': ['error', { object: true, array: false }],

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: 'req|res|next|val'
        }
      ]
    }
  },

  {
    files: ['utils/logger.js', 'utils/dummyData/seeder.js'],
    rules: {
      'no-console': 'off'
    }
  },

  {
    files: ['**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  },

  prettier
];
