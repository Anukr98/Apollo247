
const glob = require('glob');
const path = require('path');

const makeWebpackConfig = require('./webpack-make-config');

module.exports = makeWebpackConfig({
    webpackConfigOptions: {
        entry: glob.sync(path.resolve('src/doctors-service/database/migration/*.ts')).reduce((entries, filename) => {
            const migrationName = path.basename(filename, '.ts');
            return Object.assign({}, entries, {
                [migrationName]: filename,
            });
        }, {}),
    },
    isMigration: true,
    serviceName: 'doctors'
});
