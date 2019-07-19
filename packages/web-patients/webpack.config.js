const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');
const webpack = require('webpack');

const envFile = path.resolve(__dirname, '../../.env');
const setEnvVars = () => {
  const dotenv = require('dotenv');
  const config = dotenv.config({ path: envFile });
  if (config.error) {
    throw config.error;
  }
  Object.values(config).forEach((val, KEY) => (process.env[KEY] = val));
};
setEnvVars();
const isTest = process.env.NODE_ENV === 'test';
const isLocal = process.env.NODE_ENV === 'local';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');

const plugins = [
  new DotenvWebpack({ path: envFile }),
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
        include: [path.resolve(__dirname, 'src')],
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
          watchOptions: {
            ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
          },
        }
      : undefined,

  plugins,
};
