const dotenv = require('dotenv');
const glob = require('glob');
const path = require('path');

const envFile = path.resolve(__dirname, '../../.env');
const dotEnvConfig = dotenv.config({ path: envFile });
if (dotEnvConfig.error) throw dotEnvConfig.error;

console.log(process.env.NODE_ENV);
Object.values(dotEnvConfig).forEach((val, KEY) => (process.env[KEY] = val));
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
    .sync(path.resolve('src/consults-service/database/migration/*.ts'))
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
    path: __dirname + '/dist/migration/consults',
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
