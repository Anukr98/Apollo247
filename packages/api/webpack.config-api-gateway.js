const baseWebpackConfig = require('./webpack.config-base');

module.exports = {
  ...baseWebpackConfig,
  entry: { 'api-gateway': 'api-gateway.ts' },
  // watchOptions: {
  //   ...baseWebpackConfig.watchOptions,
  //   ignored: [...baseWebpackConfig.watchOptions.ignored, 'src/**-service/*'],
  // },
};
