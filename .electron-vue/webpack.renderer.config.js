'use strict'

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const fs = require('fs')
const glob = require('glob')
const webpack = require('webpack')
const { dependencies } = require('../package.json')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue']

const codemirrorModes = glob.sync(path.resolve(__dirname, '../node_modules/codemirror/mode/**/*.js'))

const inlineScript = [
  'codemirror/lib/codemirror.js',
  'codemirror/addon/mode/simple.js',
  'codemirror/addon/mode/overlay.js',
  'codemirror/addon/edit/continuelist.js',
  'codemirror/addon/display/placeholder.js'
].map((file) => {
  return path.resolve(__dirname, '../node_modules', file)
}).concat(codemirrorModes).reduce((previous, file) => {
  return previous + fs.readFileSync(file, 'utf-8')
}, '')

const inlineStyle = [
  'codemirror/lib/codemirror.css'
].map((file) => {
  return path.resolve(__dirname, '../node_modules', file)
}).reduce((previous, file) => {
  return previous + fs.readFileSync(file, 'utf-8')
}, '')

let htmls = [
  {
    filename: 'index.html',
    template: path.resolve(__dirname, '../src/index.pug')
  },
  {
    filename: 'preview.html',
    template: path.resolve(__dirname, '../src/preview.pug')
  }
].map(function (item) {
    return new HtmlWebpackPlugin({
      filename: item.filename,
      template: item.template,
      inject: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
        collapseInlineTagWhitespace: true,
        collapseBooleanAttributes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        caseSensitive: true,
        minifyJS: true,
        minifyCSS: true,
        quoteCharacter: '"'
      },
      nodeModules: process.env.NODE_ENV !== 'production'
        ? path.resolve(__dirname, '../node_modules')
        : false,
      inlineStyle,
      inlineScript
    });
});

let rendererConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/main.js'),
    preview: path.join(__dirname, '../src/renderer/preview.js')
  },
  externals: [
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!autoprefixer-loader?{browsers:["> 1%", "last 2 version"]}!less-loader'
        })
      },
      {
        test: /\.pug$/,
        use: 'pug-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: process.env.NODE_ENV === 'production',
            loaders: {
              less: 'vue-style-loader!css-loader!autoprefixer-loader?{browsers:["> 1%", "last 2 version"]}!less-loader'
            }
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new DuplicatePackageCheckerPlugin()
  ].concat(htmls),
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  resolve: {
    alias: {
      'common': path.join(__dirname, '../src/common'),
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  },
  target: 'electron-renderer'
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = ''

  rendererConfig.plugins.push(
    new BabiliWebpackPlugin({
      removeDebugger: true
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/electron/static'),
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = rendererConfig
