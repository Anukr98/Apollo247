const glob = require('glob');
const path = require('path');

const isStaging = process.env.NODE_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'local';

const tsLoader = {
  loader: 'ts-loader',
  options: isLocal
    ? {
        transpileOnly: true,
        configFile: 'migration.tsconfig.json',
      }
    : {
        configFile: 'migration.tsconfig.json',
      },
};
module.exports = {
  entry: glob
    .sync(path.resolve('src/profiles-service/database/migration/*.ts'))
    .reduce((entries, filename) => {
      const migrationName = path.basename(filename, '.ts');
      return Object.assign(entries, {
        [migrationName]: filename,
      });
    }, {}),
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    path: __dirname + '/dist/migration/profiles',
    libraryTarget: 'umd',
    filename: '[name].js',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        use: [tsLoader],
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  mode: isProduction || isStaging ? 'production' : 'development',
};
