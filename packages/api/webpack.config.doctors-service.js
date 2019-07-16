const baseWebpackConfig = require('./webpack.config._base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'doctors-service': 'doctors-service/doctors-service.ts' },
};
