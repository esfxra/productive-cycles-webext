const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: path.resolve(__dirname, './src/popup/popup.js'),
  },
  output: {
    filename: '[name].bundle.js',
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
      {
        test: /\.(png|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/_locales/en', to: '_locales/en/[name].[ext]' },
        { from: 'src/background', to: 'background/[name].[ext]' },
        { from: 'src/manifest-icons', to: 'manifest-icons/[name].[ext]' },
        { from: 'src/manifest.json', to: '[name].[ext]' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'src/popup/popup.html',
    }),
  ],
};
