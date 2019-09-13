module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'graphql', 'import'],
  rules: {
    '@typescript-eslint/array-type': ['warn', 'array'],
    '@typescript-eslint/class-name-casing': 'warn',
    '@typescript-eslint/no-array-constructor': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    'import/newline-after-import': 'warn',
    'import/no-cycle': 'error',
    'import/no-default-export': 'warn',
    'import/no-extraneous-dependencies': 'error',
    'import/no-relative-parent-imports': 'warn',
    'no-var': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
    radix: 'warn',
  },
};
