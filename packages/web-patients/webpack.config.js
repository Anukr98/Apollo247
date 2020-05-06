const path = require('path');
const process = require('process');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');
const dotenv = require('dotenv');

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
    templateParameters: {
      env: process.env.NODE_ENV,
    },
    inject: true,
    favicon: "./favicon.svg"
  })
];
if (isLocal) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new HardSourceWebpackPlugin(),
    new HardSourceWebpackPlugin.ExcludeModulePlugin([{ test: /@aph/ }])
  );
}

const rhlBabelLoader = {
  loader: 'babel-loader',
  options: {
    plugins: ['react-hot-loader/babel'],
  },
};
const tsLoader = {
  loader: 'awesome-typescript-loader',
  options: isLocal
    ? {
        useCache: true,
        transpileModule: true,
        forceIsolatedModules: true,
        reportFiles: ['src/**/*.{ts,tsx}'],
      }
    : undefined,
};
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

  // devtool: isLocal || isDevelopment ? 'source-map' : false,
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
        use: isLocal ? [rhlBabelLoader, tsLoader] : [tsLoader],
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: [urlLoader],
      },
    ],
  },

  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
    alias: isLocal
      ? {
          'react-dom': '@hot-loader/react-dom',
        }
      : undefined,
  },

  // Enable these for tree-shaking capabilities.
  // Also set `"sideEffects": false` in `package.json`
  // optimization: {
  //   sideEffects: true,
  //   usedExports: true,
  // },

  optimization: isLocal
    ? {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    : {
        // Enable these for tree-shaking capabilities.
        // Also set `"sideEffects": false` in `package.json`
        sideEffects: true,
        usedExports: true,
      },

  devServer: isLocal
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
