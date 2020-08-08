const glob = require('glob');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const isLocal = process.env.NODE_ENV === 'local';

const tsLoader = {
    loader: 'ts-loader',
    options: isLocal
        ? {
            transpileOnly: true,
        }
        : undefined,
};
module.exports = {
    entry: glob.sync(path.resolve('src/consults-service/database/migrations/*.ts')).reduce((entries, filename) => {
        const migrationName = path.basename(filename, '.ts');
        return Object.assign({}, entries, {
            [migrationName]: filename,
        });
    }, {}),
    resolve: {
        extensions: ['.ts']
    },
    output: {
        path: __dirname + '/dist/db/migrations',
        libraryTarget: 'umd',
        filename: '[name].js',
        globalObject: "this"
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
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ],
    },
};