module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    camelcase: 'warn',
    'import/no-default-export': 'warn',
    'import/no-extraneous-dependencies': 'error',
    'import/no-relative-parent-imports': 'warn',
    'no-var': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
  },
};
