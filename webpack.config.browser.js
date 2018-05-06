const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    // 'react-hot-loader/patch',
    `webpack-hot-middleware/client?path=/__webpack_hmr`,
    // 'webpack/hot/only-dev-server',
    './src/browser/index.js',
  ],
  output: {
    path: path.resolve('dist/public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval',
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
          }
        },
        'sass-loader'
      ]
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: 'assets/[hash].[ext]'
          }
        }
      ]
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      __isBrowser__: "true"
    })
  ]
}