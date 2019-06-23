const path = require('path');
const process = require('process');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

// const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');

const plugins = [
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin(
    [
      'NODE_ENV',
      'WEB_CLIENT_PORT',
      'API_GATEWAY_PORT',
      'FIREBASE_PROJECT_NAME',
      'GOOGLE_APPLICATION_CREDENTIALS',
    ].reduce(
      (result, VAR) => ({
        ...result,
        [`process.env.${VAR}`]: JSON.stringify(process.env[VAR] || '').trim(),
      }),
      {}
    )
  ),
];

const tsLoader = { loader: 'ts-loader' };

module.exports = {
  target: 'node',

  externals: [nodeExternals()],

  mode: isProduction ? 'production' : 'development',

  context: path.resolve(__dirname),

  entry: {
    'api-gateway': 'gateway/api-gateway.ts',
    'profiles-service': 'services/profiles/profiles-service.ts',
  },

  output: {
    path: distDir,
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(j|t)s?$/,
        exclude: [nodeModulesDir],
        use: [tsLoader],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [path.join(__dirname, ''), nodeModulesDir],
  },

  plugins,
};
