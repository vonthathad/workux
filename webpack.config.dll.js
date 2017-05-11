var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'react-router',
      'redux',
      'redux-thunk',
      'react-ga',
      'react-intl',
      'react-hot-loader',
      'isomorphic-fetch',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist-dev'),
    filename: '[name].js',
    library: '[name]',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dist-dev', '[name]-manifest.json'),
      name: '[name]',
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  resolve: {
    modules: [
      'node_modules',
    ],
  },
};
