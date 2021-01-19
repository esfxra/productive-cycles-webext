const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    popup: path.resolve(__dirname, './src/popup/popup.js'),
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'popup.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/popup/popup.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/_locales/en', to: '_locales/en/[name].[ext]' },
        { from: 'src/assets/audio', to: 'assets/audio/[name].[ext]' },
        { from: 'src/assets/icons', to: 'assets/icons/[name].[ext]' },
        { from: 'src/background', to: 'background/[name].[ext]' },
        { from: 'src/manifest.json', to: '[name].[ext]' },
      ],
    }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  ],
};
