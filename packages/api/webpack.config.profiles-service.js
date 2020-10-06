const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/profiles-service.bundle.js',
    watch: ['dist/profiles-service.bundle.js', 'dist/profiles-db-seeds.bundle.js'],
  },
  webpackConfigOptions: {
    entry: {
      'profiles-service': 'profiles-service/profiles-service.ts',
      'profiles-db-seeds': 'profiles-service/database/seeds.ts',
    },
  },
});
