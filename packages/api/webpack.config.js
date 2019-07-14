const path = require('path');
const process = require('process');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new FilterWarningsPlugin({
    exclude: [
      /mongodb/,
      /mssql/,
      /mysql/,
      /mysql2/,
      /oracledb/,
      /pg-native/,
      /pg-query-stream/,
      /redis/,
      /sqlite3/,
    ],
  }),
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin(
    [
      'NODE_ENV',
      'WEB_PATIENTS_PORT',
      'WEB_DOCTORS_PORT',
      'API_GATEWAY_PORT',
      'FIREBASE_PROJECT_ID',
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

const tsLoader = { loader: 'awesome-typescript-loader' };

module.exports = {
  target: 'node',

  externals: [nodeExternals()],

  mode: isProduction ? 'production' : 'development',

  context: path.resolve(__dirname, 'src'),

  // Specify via command line
  // entry: {
  //   'api-gateway': 'src/api-gateway.ts',
  //   'profiles-service': 'src/profiles-service/profiles-service.ts',
  // },

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

  watch: false, // Turn on via --watch from the command line
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: [/node_modules/],
  },

  plugins,
};
