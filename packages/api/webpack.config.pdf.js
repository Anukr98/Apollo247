const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/rxPdfHelper.bundle.js',
  },
  webpackConfigOptions: {
    entry: {
      rxPdfHelper: 'consults-service/rxPdfHelper.ts',
    },
  },
});
