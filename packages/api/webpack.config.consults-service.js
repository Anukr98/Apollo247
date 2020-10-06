const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
  nodemonPluginArgs: {
    script: 'dist/consults-service.bundle.js',
    watch: ['dist/consults-service.bundle.js', 'dist/consults-db-seeds.bundle.js'],
  },
  webpackConfigOptions: {
    entry: {
      'consults-service': 'consults-service/consults-service.ts',
      'consults-db-seeds': 'consults-service/database/seeds.ts',
    },
  },
});
