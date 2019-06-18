const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV.trim() === 'development';
const isProduction = process.env.NODE_ENV.trim() === 'production';

const distDir = path.resolve(__dirname, 'dist');
const nodeModulesDir = path.join(__dirname, 'node_modules');

let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV.trim()),
    'process.env.CLIENT_PORT': JSON.stringify(process.env.CLIENT_PORT),
    'process.env.API_PORT': JSON.stringify(process.env.API_PORT),
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    chunks: ['index'],
    template: './index.html',
    inject: true,
  }),
];
if (isDevelopment) {
  plugins = plugins.concat(new webpack.HotModuleReplacementPlugin());
}

const rhlBabelLoader = {
  loader: 'babel-loader',
  options: {
    plugins: ['react-hot-loader/babel'],
  },
};
const tsLoader = { loader: 'ts-loader' };
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

  context: path.resolve(__dirname),

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
        exclude: [nodeModulesDir],
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
    modules: [path.join(__dirname, ''), nodeModulesDir],
    alias: isDevelopment
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

  devServer: isDevelopment
    ? {
        publicPath: '/', // URL path where the webpack files are served from
        contentBase: distDir, // A directory to serve files non-webpack files from (Absolute path)
        host: '0.0.0.0',
        port: process.env.CLIENT_PORT,
        disableHostCheck: true,
        hot: true,
        inline: true,
        historyApiFallback: true,
        // We have to poll for changes bc we're running inside a docker container :(
        watchOptions: {
          aggregateTimeout: 300,
          poll: 1000,
          ignored: [nodeModulesDir],
        },
      }
    : undefined,

  plugins,
};
