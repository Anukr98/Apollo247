const baseWebpackConfig = require('./webpack.config._base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'profiles-service': 'profiles-service/profiles-service.ts' },
};
