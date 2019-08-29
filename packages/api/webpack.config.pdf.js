const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/pdf.bundle.js',
  },
  webpackConfigOptions: {
    entry: {
      pdf: 'pdf.ts',
    },
  },
});
