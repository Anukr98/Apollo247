const path = require('path');
const process = require('process');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const API_GATEWAY_PORT = (process.env.API_GATEWAY_PORT || '').trim();
const WEB_CLIENT_PORT = (process.env.WEB_CLIENT_PORT || '').trim();
const NODE_ENV = (process.env.NODE_ENV || '').trim();

// const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');

const plugins = [
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.API_GATEWAY_PORT': JSON.stringify(API_GATEWAY_PORT),
    'process.env.WEB_CLIENT_PORT': JSON.stringify(WEB_CLIENT_PORT),
  }),
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
