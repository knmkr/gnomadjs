const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const isDev = process.env.NODE_ENV === 'development'

const definitions = {
  'process.env.GNOMAD_API_URL': JSON.stringify(process.env.GNOMAD_API_URL),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
}

const gaTrackingId = process.env.GA_TRACKING_ID
if (process.env.NODE_ENV === 'production' && !gaTrackingId) {
  console.log('\nWarning: No GA tracking ID for production build\n')
}

const config = {
  devServer: {
    historyApiFallback: true,
    port: 8008,
    publicPath: '/',
    stats: 'errors-only',
  },
  devtool: 'source-map',
  entry: {
    bundle: path.resolve(__dirname, '../src/index.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!p-cancelable)/,
        use: 'babel-loader',
      },
      {
        test: /\.(gif|jpg|png)$/,
        use: 'file-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    publicPath: '/',
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin(definitions),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      gaTrackingId: process.env.GA_TRACKING_ID,
    }),
  ],
}

if (isDev) {
  config.entry.bundle = ['react-hot-loader/patch', config.entry.bundle]
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin())
}

module.exports = config
