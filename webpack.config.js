const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = (mode) => ({
  mode: mode,
  devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
  entry: {
    popup: path.resolve(__dirname, './src/popup/popup.js'),
    background: path.resolve(__dirname, './src/background/background.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
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
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/background/background.html', to: 'background.html' },
        { from: 'src/background/metal-mallet.mp3', to: 'metal-mallet.mp3' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/manifest-icons', to: 'manifest-icons/' },
        { from: 'src/_locales/', to: '_locales/' },
      ],
    }),
  ],
});

module.exports = (_, argv) => {
  return config(argv.mode);
};
