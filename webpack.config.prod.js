var path = require('path');

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ManifestPlugin = require('webpack-manifest-plugin');
var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
var WebpackChunkHash = require("webpack-chunk-hash");
var CompressionPlugin = require('compression-webpack-plugin');

var cssnext = require('postcss-cssnext');
var postcssFocus = require('postcss-focus');
var postcssReporter = require('postcss-reporter');
var cssnano = require('cssnano');

module.exports = {
  devtool: 'hidden-source-map',
  entry: {
    vendor: [
      './client/vendor.js',
    ],
    app: [
      './client/index.js',
    ],
  },

  // output: {
  //   path: __dirname + '/dist/',
  //   filename: '[name].[chunkhash].js',
  //   publicPath: '/',
  // },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js"
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
        // loader: ExtractTextPlugin.extract('css-loader', 'css-loader?localIdentName=[hash:base64]&modules&importLoaders=1!postcss-loader'),
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          // use: "css-loader!postcss-loader"
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: '[hash:base64]'
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
        }),
      }, {
        test: /\.jsx*$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }, {
        test: /\.(jpe?g|gif|png)$/i,
        loader: 'url-loader?limit=10000',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader?limit=10000'
      }
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.js',
    }),


    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ["vendor", "manifest"], // vendor libs + extracted manifest
    //   minChunks: Infinity,
    // }),
    // new webpack.HashedModuleIdsPlugin(),
    // new WebpackChunkHash(),
    // new ChunkManifestPlugin({
    //   filename: "chunk-manifest.json",
    //   manifestVariable: "webpackManifest"
    // }),

    new ExtractTextPlugin({ filename: 'app.[chunkhash].css', allChunks: true }),
    new ManifestPlugin({
      fileName: 'manifest.json',
      basePath: '/',
    }),
    new webpack.HashedModuleIdsPlugin(),
    new WebpackChunkHash(),
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest",
    }),
    new webpack.optimize.UglifyJsPlugin({
      // Eliminate comments
      comments: false,
      // Compression specific options
      compress: {
        // remove warnings
        warnings: false,
        // Drop console statements
        drop_console: true
      },
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ],
};
