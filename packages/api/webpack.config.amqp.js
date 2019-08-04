const baseWebpackConfig = require('./webpack.config._base');

module.exports = {
  ...baseWebpackConfig,
  entry: { amqp: 'amqp.ts' },
};
