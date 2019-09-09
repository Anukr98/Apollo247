const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/doctors-service.bundle.js',
    watch: ['dist/doctors-service.bundle.js', 'dist/doctors-db-seeds.bundle.js'],
  },
  webpackConfigOptions: {
    entry: {
      'doctors-service': 'doctors-service/doctors-service.ts',
      'doctors-db-seeds': 'doctors-service/database/seeds.ts',
    },
  },
});
