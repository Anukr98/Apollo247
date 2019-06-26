const path = require('path');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const webpack = require('webpack');

module.exports = (cypressConfig) => {
  // We need to make sure to set these `process.env` vars _before_ requiring the `webpack.config`!
  ['NODE_ENV', 'WEB_CLIENT_PORT', 'API_GATEWAY_PORT', 'FIREBASE_PROJECT_NAME'].forEach(
    (VAR) => (process.env[VAR] = cypressConfig.env[VAR])
  );
  const webpackConfig = require('../../webpack.config');

  const webpackOptions = {
    context: path.resolve(__dirname, '../../'),
    mode: webpackConfig.mode,
    module: webpackConfig.module,
    optimization: webpackConfig.optimization,
    resolve: webpackConfig.resolve,
    plugins: webpackConfig.plugins,
    // plugins: [
    //   new webpack.DefinePlugin({
    //     'process.env.NODE_ENV': JSON.stringify(cypressConfig.env.NODE_ENV),
    //     'process.env.WEB_CLIENT_PORT': JSON.stringify(cypressConfig.env.WEB_CLIENT_PORT),
    //     'process.env.API_CLIENT_PORT': JSON.stringify(cypressConfig.env.API_CLIENT_PORT),
    //   }),
    // ],
  };

  return webpackPreprocessor({ webpackOptions });
};
