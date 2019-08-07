/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');

const extraNodeModules = {
  '@aph/api-schema': path.resolve(__dirname + '/../api-schema'),
  '@aph/mobile-ui-components': path.resolve(__dirname + '/../mobile-ui-components/dist'),
  '@aph/shared-ui-components': path.resolve(__dirname + '/../shared-ui-components/dist'),
  '@aph/universal': path.resolve(__dirname + '/../universal/dist'),
};
const watchFolders = Object.values(extraNodeModules);

module.exports = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-typescript-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules,
  },
  watchFolders,
};
