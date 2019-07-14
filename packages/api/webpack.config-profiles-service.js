const baseWebpackConfig = require('./webpack.config-base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'profiles-service': 'profiles-service/profiles-service.ts' },
};
