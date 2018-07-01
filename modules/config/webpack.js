'use strict';

let fs = require('fs');
let nib = require('nib');
let rupture = require('rupture');
let path = require('path');
let config = require('config');
let webpack = require('webpack');
let WriteVersionsPlugin = require('lib/webpack/writeVersionsPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const fse = require('fs-extra');
const glob = require('glob');

// 3rd party / slow to build modules
// no webpack dependencies inside
// no es6 (for 6to5 processing) inside
// NB: includes angular-*
let noProcessModulesRegExp = /node_modules\/(angular|prismjs)/;

let devMode = process.env.NODE_ENV == 'development';

module.exports = function (config) {
// tutorial.js?hash
// tutorial.hash.js
  function extHash(name, ext, hash) {
    if (!hash) hash = '[hash]';
    return config.assetVersioning == 'query' ? `${name}.${ext}?${hash}` :
      config.assetVersioning == 'file' ? `${name}.${hash}.${ext}` :
        `${name}.${ext}`;
  }

  let modulesDirectories = ['node_modules'];
  if (process.env.NODE_PATH) {
    modulesDirectories = modulesDirectories.concat(process.env.NODE_PATH.split(/[:;]/).map(p => path.resolve(p)));
  }

  let webpackConfig = {
    output: {
      // fs path
      path: path.join(config.publicRoot, 'pack'),
      // path as js sees it
      // if I use another domain here, need enable Allow-Access-.. header there
      // and add  to scripts, to let error handler track errors
      publicPath: '/pack/',
      // в dev-режиме файлы будут вида [name].js, но обращения - через [name].js?[hash], т.е. версия учтена
      // в prod-режиме не можем ?, т.к. CDN его обрезают, поэтому [hash] в имени
      //  (какой-то [hash] здесь необходим, иначе к chunk'ам типа 3.js, которые генерируются require.ensure,
      //  будет обращение без хэша при загрузке внутри сборки. при изменении - барузерный кеш их не подхватит)
      filename: extHash("[name]", 'js'),

      chunkFilename: extHash("[name]-[id]", 'js'),
      library: '[name]',
      pathinfo: devMode
    },

    cache: devMode,


    mode: devMode ? 'development' : 'production', // for tests uses prod too

    watchOptions: {
      aggregateTimeout: 10
    },

    watch: devMode,

    devtool: devMode ? "cheap-inline-module-source-map" : // try "eval" ?
      process.env.NODE_ENV == 'production' ? 'source-map' : false,

    profile: false,

    entry: {
      styles: config.tmpRoot + '/styles.styl',
      head: 'client/head',
      tutorial: 'tutorial/client',
      footer: 'client/footer',
    },

    module: {
      rules: [
        {
          test: /\.json$/,
          use: 'json-loader'
        },
        {
          test: /\.yml$/,
          use: ['json-loader', 'yaml-loader']
        },
        {
          test: /\.pug$/,
          use: 'pug-loader?root=' + config.projectRoot + '/templates'
        },
        {
          test: /\.js$/,
          // babel shouldn't process modules which contain ws/browser.js,
          // which must not be run in strict mode (global becomes undefined)
          // babel would make all modules strict!
          exclude: /node_modules\/(angular|prismjs|moment|blueimp-canvas-to-blob|codemirror|markdown-it)/,
          use: [
            // babel will work first
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['env', {
                    //useBuiltIns: true,
                    targets: {
                      browsers: "> 3%"
                    }
                  }]
                ]
              }
            }
          ]
        },
        {
          test: /\.styl$/,
          // MiniCssExtractPlugin breaks HMR for CSS
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('autoprefixer')
                ]
              }
            },
            'hover-loader',
            {
              loader: 'stylus-loader',
              options: {
                linenos: true,
                'resolve url': true,
                use: [
                  rupture(),
                  nib(),
                  function (style) {
                    style.define('lang', config.lang);
                  }
                ]
              },
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|woff|eot|otf|ttf|svg)$/,
          use: extHash('file-loader?name=[path][name]', '[ext]')
        }
      ],
      noParse: function (path) {
        /*
         if (path.indexOf('!') != -1) {
         path = path.slice(path.lastIndexOf('!') + 1);
         }
         */
        //console.log(path);
        return noProcessModulesRegExp.test(path);
      }
    },


    resolve: {
      // allow require('styles') which looks for styles/index.styl
      extensions: ['.js', '.styl'],
      alias: {
        config: 'client/config',
      },
      modules: modulesDirectories
    },


    resolveLoader: {
      modules: modulesDirectories,
      extensions: ['.js']
    },

    node: {
      fs: 'empty'
    },

    plugins: [
      new webpack.DefinePlugin({
        LANG: JSON.stringify(config.lang),
        IS_CLIENT: true
      }),

      // lodash is loaded when free variable _ occurs in the code
      new webpack.ProvidePlugin({
        _: 'lodash'
      }),

      // prevent autorequire all moment locales
      // https://github.com/webpack/webpack/issues/198
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new WriteVersionsPlugin(path.join(config.cacheRoot, 'webpack.versions.json')),

      new MiniCssExtractPlugin({
        filename: devMode ? '[name].css' : extHash("[name]", 'css'),
        chunkFilename: devMode ? '[id].css' : extHash("[id]", 'css'),
      }),

      function () {

        let styles = glob.sync('styles/**/*.styl', {cwd: config.projectRoot});

        config.handlers.forEach(handler => {
          let handlerStyles = glob.sync(`handlers/${handler}/client/styles/**/*.styl`, {cwd: config.projectRoot});
          styles.push(...handlerStyles);
        });

        let content = styles.map(s => `@require '../${s}'`).join("\n");

        fs.writeFileSync(`${config.tmpRoot}/styles.styl`, content);
      },

      {
        apply: function (compiler) {
          compiler.plugin("done", function (stats) {
            console.log("Webpack done");
            stats = stats.toJson();
            fs.writeFileSync(`${config.tmpRoot}/stats.json`, JSON.stringify(stats));
          });
        }
      }
    ],

    recordsPath: path.join(config.tmpRoot, 'webpack.json'),
    devServer: {
      port: 3001, // dev server itself does not use it, but outer tasks do
      historyApiFallback: true,
      hot: true,
      watchDelay: 10,
      //noInfo: true,
      publicPath: process.env.STATIC_HOST + ':3001/pack/',
      contentBase: config.publicRoot
    },


    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: 2,
          uglifyOptions: {
            ecma: 8,
            warnings: false,
            compress: {
              drop_console: true,
              drop_debugger: true
            },
            output: {
              beautify: true,
              indent_level: 0 // for error reporting, to see which line actually has the problem
              // source maps actually didn't work in Qbaka that's why I put it here
            }
          }
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  };


//if (process.env.NODE_ENV != 'development') { // production, ebook
  if (process.env.NODE_ENV == 'production') { // production, ebook
    webpackConfig.plugins.push(
      function clearBeforeRun() {
        function clear(compiler, callback) {
          fse.removeSync(webpackConfig.output.path + '/*');
          callback();
        }

        // in watch mode this will clear between partial rebuilds
        // thus removing unchanged files
        // => use this plugin only in normal run
        this.plugin('run', clear);
      }
    );
  }

  return webpackConfig;
};
