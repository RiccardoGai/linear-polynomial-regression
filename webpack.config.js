const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
  const prod = env.production;
  return {
    entry: './src/index',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'bundle.js'
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: prod,
                sourceMap: !prod
              }
            },
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new MiniCssExtractPlugin({ filename: 'bundle.css' })
    ]
  };
};
