
const glob = require('glob');
const path = require('path');

const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
    webpackConfigOptions: {
        entry: glob.sync(path.resolve('src/consults-service/database/migrations/*.ts')).reduce((entries, filename) => {
            const migrationName = path.basename(filename, '.ts');
            return Object.assign({}, entries, {
                [migrationName]: filename,
            });
        }, {}),
    },
    isMigration: true
});




// const DotenvPlugin = require('dotenv-webpack');
// const dotenv = require('dotenv');
// const isLocal = process.env.NODE_ENV === 'local';
// const isStaging = process.env.NODE_ENV === 'staging';
// const isProduction = process.env.NODE_ENV === 'production';

// const envFile = path.resolve(__dirname, '../../.env');
// const dotEnvConfig = dotenv.config({ path: envFile });

// if (dotEnvConfig.error) throw dotEnvConfig.error;


// const distDir = path.resolve(__dirname, 'dist/db/migrations');
// const plugins = [new DotenvPlugin({ path: envFile })];
// if (isLocal) {
//     plugins.push(new forkTsCheckerWebpackPlugin(), new NodemonPlugin({ ...nodemonPluginArgs }));
// }
// const tsLoader = {
//     loader: 'ts-loader',
//     options: isLocal
//         ? {
//             transpileOnly: true,
//         }
//         : undefined,
// };
// module.exports = {
    // entry: glob.sync(path.resolve('src/consults-service/database/migrations/*.ts')).reduce((entries, filename) => {
    //     const migrationName = path.basename(filename, '.ts');
    //     return Object.assign({}, entries, {
    //         [migrationName]: filename,
    //     });
    // }, {}),
//     resolve: {
//         extensions: ['.ts']
//     },
//     output: {
//         path: distDir,
//         libraryTarget: 'umd',
//         filename: '[name].js',
//         globalObject: "this"
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.(j|t)s?$/,
//                 exclude: [/node_modules/],
//                 use: [tsLoader],
//             },
//         ],
//     },
//     mode: isProduction || isStaging ? 'production' : 'development',
//     optimization: {
//         minimizer: [
//             new UglifyJsPlugin({
//                 uglifyOptions: {
//                     keep_classnames: true,
//                     keep_fnames: true
//                 }
//             })
//         ],
//     },
//     watch: isLocal,
//     watchOptions: {
//         poll: 3000,
//         aggregateTimeout: 300,
//         ignored: [/node_modules([\\]+|\/)+(?!@aph)/],
//     },
//     plugins
// };