const path = require('path');
const process = require('process');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

// const API_PORT = process.env.API_PORT.trim();
const CLIENT_PORT = process.env.CLIENT_PORT.trim();
const NODE_ENV = process.env.NODE_ENV.trim();

// const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');

const plugins = [
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.CLIENT_PORT': JSON.stringify(CLIENT_PORT),
  }),
];

const tsLoader = { loader: 'ts-loader' };

module.exports = {
  target: 'node',

  externals: [nodeExternals()],

  mode: isProduction ? 'production' : 'development',

  context: path.resolve(__dirname),

  entry: { api: ['api.ts'] },

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
