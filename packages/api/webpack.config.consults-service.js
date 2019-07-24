const baseWebpackConfig = require('./webpack.config._base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'consults-service': 'consults-service/consults-service.ts' },
};
