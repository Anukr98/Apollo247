const baseWebpackConfig = require('./webpack.config-base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'doctors-service': 'doctors-service/doctors-service.ts' },
};
