// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
// };
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@aph/mobile-doctors/src': './src',
          '@aph/mobile-doctors/': './',
        },
        cwd: 'babelrc',
      },
    ],
  ],
};
