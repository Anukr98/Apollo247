const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isTest = process.env.NODE_ENV === 'test';
const isLocal = process.env.NODE_ENV === 'local';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');

const plugins = [
  new webpack.DefinePlugin(
    ['NODE_ENV', 'WEB_PATIENTS_PORT', 'API_GATEWAY_PORT', 'FIREBASE_PROJECT_ID'].reduce(
      (result, VAR) => ({
        ...result,
        [`process.env.${VAR}`]: JSON.stringify(process.env[VAR].trim()),
      }),
      {}
    )
  ),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    chunks: ['index'],
    template: './index.html',
    inject: true,
  }),
];
if (isLocal || isDevelopment) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

const rhlBabelLoader = {
  loader: 'babel-loader',
  options: {
    plugins: ['react-hot-loader/babel'],
  },
};
const tsLoader = { loader: 'awesome-typescript-loader' };
const urlLoader = {
  loader: 'url-loader',
  options: {
    limit: 16384,
    fallback: 'file-loader',
    name: '[path][name]-[hash:6].[ext]',
  },
};

module.exports = {
  mode: isProduction ? 'production' : 'development',

  context: path.resolve(__dirname, 'src'),

  entry: { index: ['index.tsx'] },

  output: {
    publicPath: '/', // Where you uploaded your bundled files. (Relative to server root)
    path: distDir, // Local disk directory to store all your output files (Absolute path)
    filename: '[name]-[hash:6].bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: [/node_modules/],
        use: isProduction ? [tsLoader] : [rhlBabelLoader, tsLoader],
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: [urlLoader],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
    alias:
      isTest || isLocal || isDevelopment
        ? {
            'react-dom': '@hot-loader/react-dom',
          }
        : undefined,
  },

  optimization: {
    // Enable these for tree-shaking capabilities.
    // Also set `"sideEffects": false` in `package.json`
    sideEffects: true,
    usedExports: true,
  },

  devServer:
    isTest || isLocal || isDevelopment
      ? {
          publicPath: '/', // URL path where the webpack files are served from
          contentBase: distDir, // A directory to serve files non-webpack files from (Absolute path)
          host: '0.0.0.0',
          port: process.env.WEB_PATIENTS_PORT,
          disableHostCheck: true,
          hot: true,
          inline: true,
          historyApiFallback: true,
          // We have to poll for changes bc we're running inside a docker container :(
          watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
            ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
          },
        }
      : undefined,

  plugins,
};
