const path = require('path');
const process = require('process');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const dotenv = require('dotenv');

const envFile = path.resolve(__dirname, '../../.env');
const dotEnvConfig = dotenv.config({ path: envFile });
if (dotEnvConfig.error) throw dotEnvConfig.error;
Object.values(dotEnvConfig).forEach((val, KEY) => (process.env[KEY] = val));
const isLocal = process.env.NODE_ENV === 'local';
const isStaging = process.env.NODE_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new DotenvPlugin({ path: envFile }),
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: true,
    allowAsyncCycles: false,
    cwd: process.cwd(),
  }),
];
if (isLocal) plugins.push(new NodemonPlugin());

const tsLoader = { loader: 'awesome-typescript-loader' };

module.exports = {
  target: 'node',

  externals: [nodeExternals()],

  mode: isProduction || isStaging ? 'production' : 'development',

  context: path.resolve(__dirname, 'src'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(j|t)s?$/,
        exclude: [/node_modules/],
        use: [tsLoader],
      },
    ],
  },

  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    modules: [path.join(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
  },

  watch: isLocal,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000, // We have to poll bc we're inside a docker container :(
    ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
  },

  plugins,
};
