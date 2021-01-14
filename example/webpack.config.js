/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'development',
  entry: './example/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      vue: '@vue/runtime-dom',
      vuex: 'vuex/dist/vuex.esm-bundler',
      '@': __dirname,
      '@src': path.join(__dirname, '../src'),
      '@services': path.join(__dirname, 'services'),
      '@components': path.join(__dirname, 'components'),
      '@containers': path.join(__dirname, 'containers'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
      {
        test: /\.js|\.ts|\.tsx$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              appendTsxSuffixTo: [/\.vue$/],
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html',
    }),
    new VueLoaderPlugin(),
  ],
  devServer: {
    compress: true,
    port: 8080,
  },
};
