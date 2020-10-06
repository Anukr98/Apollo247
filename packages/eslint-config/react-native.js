module.exports = {
  env: {
    'react-native/react-native': true,
    browser: false,
  },
  plugins: ['react-native'],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/no-raw-text': 'warn',
    'react-native/split-platform-components': 'warn',
  },
};
