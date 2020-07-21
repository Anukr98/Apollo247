const path = require('path');
const process = require('process');
//const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const dotenv = require('dotenv');
const forkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = ({ nodemonPluginArgs, webpackConfigOptions }) => {
  const envFile = path.resolve(__dirname, '../../.env');
  const dotEnvConfig = dotenv.config({ path: envFile });
  if (dotEnvConfig.error) throw dotEnvConfig.error;
  Object.values(dotEnvConfig).forEach((val, KEY) => (process.env[KEY] = val));
  const isLocal = process.env.NODE_ENV === 'local';
  const isStaging = process.env.NODE_ENV === 'staging';
  const isProduction = process.env.NODE_ENV === 'production';

  const distDir = path.resolve(__dirname, 'dist');

  const plugins = [new DotenvPlugin({ path: envFile })];

  if (isLocal) {
    plugins.push(new forkTsCheckerWebpackPlugin(), new NodemonPlugin({ ...nodemonPluginArgs }));
  }

  const tsLoader = {
    loader: 'ts-loader',
    options: isLocal
      ? {
        transpileOnly: true,
      }
      : undefined,
  };
  const cache = isLocal
    ? {
      type: 'memory',
    }
    : false;
  return {
    target: 'node',

    // Whitelist our local @aph modules so that they _are_ included in our bundles (not external)
    // This allows us to use process.env vars inside @aph modules (as they will be bundled with the app via webpack)
    externals: nodeExternals({ whitelist: [/@aph/] }),

    mode: isProduction || isStaging ? 'production' : 'development',

    context: path.resolve(__dirname),
    cache: cache,
    output: {
      path: distDir,
      filename: '[name].bundle.js',
      pathinfo: false,
    },

    // Don't minify our code because typeorm relies on module names
    optimization: {
      minimize: false,
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
      poll: 3000,
      aggregateTimeout: 300,
      ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
    },

    plugins,

    ...webpackConfigOptions,
  };
};