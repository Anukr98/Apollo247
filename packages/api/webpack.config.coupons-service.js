const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/coupons-service.bundle.js',
    watch: ['dist/coupons-service.bundle.js'],
  },
  webpackConfigOptions: {
    entry: {
      'coupons-service': 'coupons-service/coupons-service.ts',
    },
  },
});
