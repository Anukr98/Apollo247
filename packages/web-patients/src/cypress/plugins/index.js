const webpackPreprocessorPlugin = require('./webpack-preprocessor-plugin');

module.exports = (on, config) => {
  on('file:preprocessor', webpackPreprocessorPlugin(config));
};
