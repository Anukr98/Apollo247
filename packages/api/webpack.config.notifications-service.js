const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/notifications-service.bundle.js',
    watch: 'dist/notifications-service.bundle.js',
  },
  webpackConfigOptions: {
    entry: {
      'notifications-service': 'notifications-service/notifications-service.ts',
    },
  },
});
