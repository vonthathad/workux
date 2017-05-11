var cssnext = require('postcss-cssnext');
var postcssFocus = require('postcss-focus');
var postcssReporter = require('postcss-reporter');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssModulesIdentName = '[name]__[local]__[hash:base64:5]';
if (process.env.NODE_ENV === 'production') {
  cssModulesIdentName = '[hash:base64]';
}

module.exports = {
  output: {
    publicPath: '/',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
          use: [
            {loader: "style-loader"},
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                importLoaders: 1,
                localIdentName: cssModulesIdentName
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  postcssFocus(),
                  cssnext({
                    browsers: ['last 2 versions', 'IE > 10'],
                  }),
                  cssnano({
                    autoprefixer: false
                  }),
                  postcssReporter({
                    clearMessages: true,
                  }),
                ],
              }
            }
          ]
        // }),
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader'
      }
    ],
  },
};
