const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');
const webpack = require('webpack');
const dotenv = require('dotenv');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const envFile = path.resolve(__dirname, '../../.env');
const dotEnvConfig = dotenv.config({ path: envFile });
if (dotEnvConfig.error) throw dotEnvConfig.error;
Object.values(dotEnvConfig).forEach((val, KEY) => (process.env[KEY] = val));
const isLocal = process.env.NODE_ENV === 'local';
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.NODE_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production';

const distDir = path.resolve(__dirname, 'dist');

const plugins = [
  new DotenvWebpack({ path: envFile }),
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: true,
    allowAsyncCycles: false,
    cwd: process.cwd(),
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    chunks: ['index'],
    template: './index.html',
    templateParameters: { env: process.env.NODE_ENV },
    inject: true,
  }),
];
if (isLocal) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(path.join(distDir, 'dependencies.dll.manifest.json')),
    })
  );
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
  mode: isStaging || isProduction ? 'production' : 'development',

  devtool: isLocal || isDevelopment ? 'eval' : false,

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
        // use: isLocal ? [rhlBabelLoader, tsLoader] : [tsLoader],
        use: [tsLoader],
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: [urlLoader],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
    alias: isLocal
      ? {
          'react-dom': '@hot-loader/react-dom',
        }
      : undefined,
  },

  // optimization: {
  // Enable these for tree-shaking capabilities.
  // Also set `"sideEffects": false` in `package.json`
  //   sideEffects: true,
  //   usedExports: true,
  // },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },

  devServer: isLocal
    ? {
        stats: 'verbose',
        publicPath: '/', // URL path where the webpack files are served from
        contentBase: distDir, // A directory to serve files non-webpack files from (Absolute path)
        host: '0.0.0.0',
        port: process.env.WEB_DOCTORS_PORT,
        disableHostCheck: true,
        hot: true,
        inline: true,
        historyApiFallback: true,
        watchOptions: {
          ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
        },
        proxy: {
          '/azureStorageEmulatorProxy': {
            target: `http://localhost:${process.env.AZURE_STORAGE_EMULATOR_PORT}`,
            pathRewrite: { '^/azureStorageEmulatorProxy': '' },
          },
        },
      }
    : undefined,

  plugins,
};
