module.exports = [
  {
    ignores: ['dist/', 'node_modules/', '.playwright/', 'coverage/'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      playwright: require('eslint-plugin-playwright'),
    },
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-private-class-members': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Playwright best-practice rules
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-unused-locators': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-element-handle': 'warn',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-raw-locators': 'warn',
    },
  },
];
