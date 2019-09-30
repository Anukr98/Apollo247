const path = require('path');
const process = require('process');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const dotenv = require('dotenv');

module.exports = ({ nodemonPluginArgs, webpackConfigOptions }) => {
  const envFile = path.resolve(__dirname, '../../.env');
  const dotEnvConfig = dotenv.config({ path: envFile });
  if (dotEnvConfig.error) throw dotEnvConfig.error;
  Object.values(dotEnvConfig).forEach((val, KEY) => (process.env[KEY] = val));
  const isLocal = process.env.NODE_ENV === 'local';
  const isStaging = process.env.NODE_ENV === 'staging';
  const isProduction = process.env.NODE_ENV === 'production';

  const distDir = path.resolve(__dirname, 'dist');

  const plugins = [
    new DotenvPlugin({ path: envFile }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
  ];
  if (isLocal) {
    plugins.push(
      new NodemonPlugin({ ...nodemonPluginArgs }),
      new HardSourceWebpackPlugin(),
      new HardSourceWebpackPlugin.ExcludeModulePlugin([{ test: /@aph/ }])
    );
  }

  const tsLoader = {
    loader: 'awesome-typescript-loader',
    options: isLocal
      ? {
          useCache: true,
          transpileModule: true,
          forceIsolatedModules: true,
        }
      : undefined,
  };

  return {
    target: 'node',

    // Whitelist our local @aph modules so that they _are_ included in our bundles (not external)
    // This allows us to use process.env vars inside @aph modules (as they will be bundled with the app via webpack)
    externals: nodeExternals({ whitelist: [/@aph/] }),

    mode: isProduction || isStaging ? 'production' : 'development',

    context: path.resolve(__dirname, 'src'),

    output: {
      path: distDir,
      filename: '[name].bundle.js',
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
