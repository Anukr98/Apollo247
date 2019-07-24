// We need to have webpack in scope for this preprocessor to work
const webpack = require('webpack'); // eslint-disable-line @typescript-eslint/no-unused-vars
const path = require('path');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');

module.exports = (cypressConfig) => {
  const webpackConfig = require('../../../webpack.config');

  // For some reason, cypress won't work with the `awesome-typescript-loader` our app's
  // webpack config uses. Override the `module` key to use the vanilla `ts-loader`
  const tsLoader = { loader: 'ts-loader' };
  const urlLoader = {
    loader: 'url-loader',
    options: {
      limit: 16384,
      fallback: 'file-loader',
      name: '[path][name]-[hash:6].[ext]',
    },
  };

  const webpackOptions = {
    context: path.resolve(__dirname, '../../'),
    mode: webpackConfig.mode,
    module: {
      ...webpackConfig.module,
      rules: [
        {
          test: /\.(j|t)sx?$/,
          exclude: [/node_modules/],
          use: [tsLoader],
        },
        {
          test: /\.(png|jpg|jpeg|svg|gif)$/,
          use: [urlLoader],
        },
      ],
    },
    optimization: webpackConfig.optimization,
    resolve: webpackConfig.resolve,
    plugins: webpackConfig.plugins,
  };

  return webpackPreprocessor({ webpackOptions });
};
