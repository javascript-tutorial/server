'use strict';

var fs = require('fs');
var nib = require('nib');
var rupture = require('rupture');
var path = require('path');
var config = require('config');
var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var WriteVersionsPlugin = require('lib/webpack/writeVersionsPlugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var del = require('del');

// 3rd party / slow to build modules
// no webpack dependencies inside
// no es6 (for 6to5 processing) inside
// NB: includes angular-*
var noProcessModulesRegExp = /node_modules\/(angular|prismjs)/;

module.exports = function(config) {
// tutorial.js?hash
// tutorial.hash.js
  function extHash(name, ext, hash) {
    if (!hash) hash = '[hash]';
    return config.assetVersioning == 'query' ? `${name}.${ext}?${hash}` :
      config.assetVersioning == 'file' ? `${name}.${hash}.${ext}` :
        `${name}.${ext}`;
  }

  var modulesDirectories = ['node_modules'];
  if (process.env.NODE_PATH) {
    modulesDirectories = modulesDirectories.concat(process.env.NODE_PATH.split(/[:;]/).map(p => path.resolve(p)));
  }

  var webpackConfig = {
    output: {
      // fs path
      path:       path.join(config.publicRoot, 'pack'),
      // path as js sees it
      // if I use another domain here, need enable Allow-Access-.. header there
      // and add  to scripts, to let error handler track errors
      publicPath: '/pack/',
      // в dev-режиме файлы будут вида [name].js, но обращения - через [name].js?[hash], т.е. версия учтена
      // в prod-режиме не можем ?, т.к. CDN его обрезают, поэтому [hash] в имени
      //  (какой-то [hash] здесь необходим, иначе к chunk'ам типа 3.js, которые генерируются require.ensure,
      //  будет обращение без хэша при загрузке внутри сборки. при изменении - барузерный кеш их не подхватит)
      filename:   extHash("[name]", 'js'),

      chunkFilename: extHash("[name]-[id]", 'js'),
      library:       '[name]',
      pathInfo:      process.env.NODE_ENV == 'development'
    },

    cache: process.env.NODE_ENV == 'development',

    watchOptions: {
      aggregateTimeout: 10
    },

    watch: process.env.NODE_ENV == 'development',

    devtool: process.env.NODE_ENV == 'development' ? "cheap-inline-module-source-map" : // try "eval" ?
               process.env.NODE_ENV == 'production' ? 'source-map' : null,

    profile: true,

    entry: {
      styles:                    config.tmpRoot + '/styles.styl',
      head:                      'client/head',
      tutorial:                  'tutorial/client',
      footer:                    'client/footer',
    },

    module: {
      loaders: [
        {
          test:   /\.json$/,
          loader: 'json'
        },
        {
          test:   /\.yml$/,
          loader: 'json!yaml'
        },
        {
          test:   /\.jade$/,
          loader: "jade?root=" + config.projectRoot + '/templates'
        },
        {
          test:    /\.js$/,
          // babel shouldn't process modules which contain ws/browser.js,
          // which must not be run in strict mode (global becomes undefined)
          // babel would make all modules strict!
          exclude: /node_modules\/(angular|prismjs|moment|blueimp-canvas-to-blob|codemirror|markdown-it)/,
          loaders: ['ng-annotate', 'babel?presets[]=es2015'] // babel will work first
        },
        {
          test:   /\.styl$/,
          // ExtractTextPlugin breaks HMR for CSS
          loader: ExtractTextPlugin.extract('style', 'css!autoprefixer!hover!stylus?linenos=true&resolve url=true')
          //loader: 'style!css!autoprefixer?browsers=last 2 version!stylus?linenos=true'
        },
        {
          test:   /\.(png|jpg|gif|woff|eot|otf|ttf|svg)$/,
          loader: extHash('file?name=[path][name]', '[ext]')
        }
      ],
      noParse: [
        // regexp gets full path with loader like
        // '/js/javascript-nodejs/node_modules/client/angular.js'
        // or even
        // '/js/javascript-nodejs/node_modules/6to5-loader/index.js?modules=commonInterop!/js/javascript-nodejs/node_modules/client/head/index.js'
        {
          test: function(path) {
            /*
             if (path.indexOf('!') != -1) {
             path = path.slice(path.lastIndexOf('!') + 1);
             }
             */
            //console.log(path);
            return noProcessModulesRegExp.test(path);
          }
        }
      ]
    },

    stylus: {
      use: [
        rupture(),
        nib(),
        function(style) {
          style.define('lang', config.lang);
        }]
    },

    resolve: {
      // allow require('styles') which looks for styles/index.styl
      extensions: ['.js', '', '.styl'],
      alias:      {
        config:          'client/config'
      },
                  modulesDirectories
    },

    resolveLoader: {
                       modulesDirectories,
      moduleTemplates: ['*-loader', '', '*Loader'],
      extensions:      ['.js', '']
    },

    node: {
      fs: 'empty'
    },

    plugins: [
      new webpack.DefinePlugin({
        LANG:      JSON.stringify(config.lang),
        IS_CLIENT: true
      }),

      // lodash is loaded when free variable _ occurs in the code
      new webpack.ProvidePlugin({
        _: 'lodash'
      }),

      // prevent autorequire all moment locales
      // https://github.com/webpack/webpack/issues/198
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      // any common chunks from entries go to head
      new CommonsChunkPlugin("head", extHash("head", 'js')),
      new WriteVersionsPlugin(path.join(config.manifestRoot, "pack.versions.json")),

      new ExtractTextPlugin(extHash('[name]', 'css', '[contenthash]'), {allChunks: true}),

      function() {
        // create config.tmpRoot/styles.styl with common styles & styles from handlers
        let content = `
          @require '~styles/common.styl'

          @require '~styles/${config.lang}.styl'
        `;

        config.handlers.forEach(handler => {
          if (fs.existsSync(`${config.projectRoot}/handlers/${handler}/client/styles/global/common.styl`)) {
            content += `\n@require '~${handler}/client/styles/global/common.styl'`;
          }

          if (fs.existsSync(`${config.projectRoot}/handlers/${handler}/client/styles/global/${config.lang}.styl`)) {
            content += `\n@require('~${handler}/client/styles/global/${config.lang}.styl'`;
          }
        });

        fs.writeFileSync(`${config.tmpRoot}/styles.styl`, content);
      },

      {
        apply: function(compiler) {
          compiler.plugin("done", function(stats) {
            stats = stats.toJson();
            fs.writeFileSync(`${config.tmpRoot}/stats.json`, JSON.stringify(stats));
          });
        }
      }
    ],

    recordsPath: path.join(config.tmpRoot, 'webpack.json'),
    devServer:   {
      port:               3001, // dev server itself does not use it, but outer tasks do
      historyApiFallback: true,
      hot:                true,
      watchDelay:         10,
      //noInfo: true,
      publicPath:         process.env.STATIC_HOST + ':3001/pack/',
      contentBase:        config.publicRoot
    }
  };


//if (process.env.NODE_ENV != 'development') { // production, ebook
  if (process.env.NODE_ENV == 'production') { // production, ebook
    webpackConfig.plugins.push(
      function clearBeforeRun() {
        function clear(compiler, callback) {
          del.sync(this.options.output.path + '/*');
          callback();
        }

        // in watch mode this will clear between partial rebuilds
        // thus removing unchanged files
        // => use this plugin only in normal run
        this.plugin('run', clear);
      },

      /* jshint -W106 */
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          // don't show unreachable variables etc
          warnings:     false,
          drop_console: true,
          unsafe:       true,
          screw_ie8:    true
        },
        beautify: true,
        output:   {
          indent_level: 0 // for error reporting, to see which line actually has the problem
          // source maps actually didn't work in Qbaka that's why I put it here
        }
      })
    );
  }

  return webpackConfig;
};
