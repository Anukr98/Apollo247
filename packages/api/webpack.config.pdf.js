const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/rxPdf.bundle.js',
  },
  webpackConfigOptions: {
    entry: {
      rxPdf: 'consults-service/resolvers/rxPdf.ts',
    },
  },
});
