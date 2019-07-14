const baseWebpackConfig = require('./webpack.config._base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'api-gateway': 'api-gateway.ts' },
};
