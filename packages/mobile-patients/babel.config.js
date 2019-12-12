module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@aph/mobile-patients/src': './src',
        },
        cwd: 'babelrc',
      },
    ],
  ],
};

// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
// };
