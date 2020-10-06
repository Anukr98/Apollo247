const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/api-gateway.bundle.js',
    watch: 'dist/api-gateway.bundle.js',
  },
  webpackConfigOptions: {
    entry: {
      'api-gateway': 'api-gateway.ts',
    },
  },
});
