const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env) => {
  const isProduction = env.production;
  const outputPath = path.resolve(__dirname, isProduction ? '../../docs' : 'dist');
  const publicPath = isProduction ? 'https://tnocs.github.io/test_ziekenhuizen/' : '/';
  console.log(`Running in ${isProduction ? 'production' : 'development'} mode, output directed to ${outputPath}.`);

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/app.ts',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      port: 3366,
      // contentBase: './dist',
    },
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        title: 'TNO - Geboortezorg',
        favicon: './src/favicon.ico',
        meta: { viewport: 'width=device-width, initial-scale=1' },
      }),
      new HtmlWebpackTagsPlugin({
        metas: [
          {
            attributes: { property: 'og:title', content: 'TNO - Geboortezorg' },
          },
          {
            attributes: {
              property: 'og:description',
              content:
                'Onderzoek welke ziekenhuizen essentieel zijn om een adequate geboortezorg in Nederland te garanderen.',
            },
          },
          {
            attributes: { property: 'og:url', content: 'https://tnocs.github.io/test_ziekenhuizen' },
          },
          // {
          //   path: './src/assets/logo.svg',
          //   attributes: {
          //     property: 'og:image',
          //   },
          // },
          {
            attributes: { property: 'og:locale', content: 'nl_NL' },
          },
          {
            attributes: { property: 'og:site_name', content: 'Geboortezorg' },
          },
          {
            attributes: { property: 'og:image:alt', content: 'TNO Geboortezorg' },
          },
          {
            attributes: {
              property: 'og:image:type',
              content: 'image/svg',
            },
          },
          {
            attributes: {
              property: 'og:image:width',
              content: '200',
            },
          },
          {
            attributes: {
              property: 'og:image:height',
              content: '200',
            },
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        // {
        //   test: /\.css$/i,
        //   use: ['style-loader', 'css-loader'],
        // },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        // {
        //   test: /\.(csv|tsv)$/i,
        //   use: ['csv-loader'],
        // },
        // {
        //   test: /\.xml$/i,
        //   use: ['xml-loader'],
        // },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    optimization: {
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        // `...`,
        new CssMinimizerPlugin(),
      ],
    },
    output: {
      filename: 'bundle.js',
      path: outputPath,
      clean: true,
      publicPath,
    },
  };
};
