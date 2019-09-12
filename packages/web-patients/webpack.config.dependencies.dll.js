const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

const distDir = path.resolve(__dirname, 'dist');

const allDependencies = Object.keys(packageJson.dependencies);
const dependencies = allDependencies.filter(
  (dep) => !dep.startsWith('@aph') && !dep.startsWith('react-hot-loader')
);
console.log('Bundling dependencies dll...', dependencies);

module.exports = {
  mode: 'development',

  context: process.cwd(),

  entry: { dependencies },

  output: {
    filename: '[name].dll.js',
    path: distDir,
    library: '[name]',
  },

  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]',
      path: path.join(distDir, '[name].dll.manifest.json'),
    }),
  ],
};
