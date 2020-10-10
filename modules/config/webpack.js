let fs = require('fs');
let config = require('config');
let path = require('path');

// 3rd party / slow to build modules
// no webpack dependencies inside
// no es6 (for 6to5 processing) inside
// NB: includes angular-*
let noProcessModulesRegExp = new RegExp("node_modules" + (path.sep === '/' ? path.sep : '\\\\') + "(angular|prismjs|sanitize-html|i18n-iso-countries)");

let devMode = process.env.NODE_ENV == 'development';


module.exports = function () {

  let nib = require('nib');
  let rupture = require('rupture');
  let chokidar = require('chokidar');
  let webpack = require('webpack');
  let WriteVersionsPlugin = require('engine/webpack/writeVersionsPlugin');
  let CssWatchRebuildPlugin = require('engine/webpack/cssWatchRebuildPlugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
  const fse = require('fs-extra');


// tutorial.js?hash
// tutorial.hash.js
  function extHash(name, ext, hash) {
    if (!hash) hash = '[hash]';
    return config.assetVersioning == 'query' ? `${name}.${ext}?${hash}` :
      config.assetVersioning == 'file' ? `${name}.${hash}.${ext}` :
        `${name}.${ext}`;
  }

  let modulesDirectories = [path.join(process.cwd(), 'node_modules')];
  if (process.env.NODE_PATH) {
    modulesDirectories = modulesDirectories.concat(process.env.NODE_PATH.split(/[:;]/).map(p => path.resolve(p)));
  }

  //console.log("MODULE DIRS", modulesDirectories);


  /**
   * handler/client/assets/* goes to public/assets/
   */
  let assetPaths = [config.assetsRoot];
  for (let handlerName in config.handlers) {
    let handlerPath = config.handlers[handlerName].path;
    let from = `${handlerPath}/client/assets`;

    if (fse.existsSync(from)) {
      assetPaths.push(from);
    }
  }

  //console.log("ASSET PATHS", assetPaths);

  /**
   * handler/client becomes handler.js
   * handler/templates makes handler.css (via CssWatchRebuiltPlugin)
   */
  let entries = {
    head:      'client/head',
    footer:    'client/footer',
    tutorial:  'engine/koa/tutorial/client',
    styles:    config.tmpRoot + '/styles.styl',
    frontpage: config.tmpRoot + '/frontpage.styl'
  };

  /*
  for(let handlerName in config.handlers) {
    let handlerNameShort = path.basename(handlerName);
    let handlerPath = config.handlers[handlerName].path;
    let e = [];
    if (fse.existsSync(`${handlerPath}/client`)) {
      e.push(`${handlerPath}/client`);
    }
    if (fse.existsSync(`${handlerPath}/templates`)) {
      e.push(config.tmpRoot + `/${handlerNameShort}.styl`);
    }

    if (e.length) {
      entries[handlerNameShort] = e;
    }
  }*/
  //console.log("WEBPACK ENTRIES", entries);


  let webpackConfig = {
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
      pathinfo:      devMode
    },

    cache: devMode,


    mode: devMode ? 'development' : 'production', // for tests uses prod too

    watchOptions: {
      aggregateTimeout: 10,
      ignored:          /node_modules/
    },

    watch: devMode,

    devtool: devMode ? "cheap-inline-module-source-map" : // try "eval" ?
               process.env.NODE_ENV == 'production' ? 'source-map' : false,

    profile: Boolean(process.env.WEBPACK_STATS),

    entry: entries,

    /*
        entry: {
          styles: config.tmpRoot + '/styles.styl',
          head: 'client/head',
          tutorial: 'engine/koa/tutorial/client',
          footer: 'client/footer',
        },*/

    module: {
      rules:   [
        {
          test: /\.yml$/,
          use:  ['json-loader', 'yaml-loader']
        },
        {
          test: /\.pug$/,
          use:  'pug-loader?root=' + config.projectRoot + '/templates&globals=__'
        },
        {
          test:    /\.js$/,
          // babel shouldn't process modules which contain ws/browser.js,
          // which must not be run in strict mode (global becomes undefined)
          // babel would make all modules strict!
          exclude: noProcessModulesRegExp,
          use:     [
            // babel will work first
            {
              loader:  'babel-loader',
              options: {
                presets: [
                  // use require.resolve here to build files from symlinks
                  [require.resolve('babel-preset-env'), {
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
          use:  [
            MiniCssExtractPlugin.loader,
            {
              loader:  'css-loader',
              options: {
                importLoaders: 1
              }
            },
            {
              loader:  'postcss-loader',
              options: {
                plugins: [
                  require('autoprefixer')
                ]
              }
            },
            'engine/webpack/hover-loader',
            {
              loader:  'stylus-loader',
              options: {
                linenos:       true,
                'resolve url': true,
                use:           [
                  rupture(),
                  nib(),
                  function (style) {
                    style.define('lang', config.lang);
                    style.define('isRTL', ['ar','fa','he'].includes(process.env.TUTORIAL_LANG));
                    style.define('env', config.env);
                  }
                ]
              },
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|woff|eot|otf|ttf|svg)$/,
          use:  extHash('file-loader?name=[path][name]', '[ext]')
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
      alias:      {
        'entities/maps/entities.json': 'engine/markit/emptyEntities',
        config:                        'client/config'
      },
      modules:    modulesDirectories
    },


    resolveLoader: {
      modules:    modulesDirectories,
      extensions: ['.js']
    },

    node: {
      fs: 'empty'
    },

    performance: {
      maxEntrypointSize: 350000,
      maxAssetSize: 350000, // warning if asset is bigger than 300k
      assetFilter(assetFilename) {  // only check js/css
        // ignore assets copied by CopyWebpackPlugin
        if (assetFilename.startsWith('..')) { // they look like ../courses/achievements/course-complete.svg
          // built assets do not have ..
          return false;
        }
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      }
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

      // ignore all locales except current lang
      new webpack.IgnorePlugin({
        checkResource(arg) {
          // locale requires that file back from it, need to keep it
          if (arg === '../moment') return false; // don't ignore this
          if (arg === './' + config.lang || arg === './' + config.lang + '.js') return false; // don't ignore current locale
          tmp = arg; // for logging only
          return true;
        },
        // under dirs like: ../locales/..
        checkContext(arg) {
          let ignore = arg.endsWith(path.join('node_modules', 'moment', 'locale'));
          if (ignore) {
            // console.log("ignore moment locale", tmp, arg);
            return true;
          }
        }
      }),


      // ignore site locale files except the lang
      new webpack.IgnorePlugin({
        checkResource(arg) {
          let result = arg.endsWith('.yml') && !arg.endsWith('/' + config.lang + '.yml');
          tmp = arg; // for logging
          return result;
        },
        // under dirs like: ../locales/..
        checkContext(arg) {
          let ignore = /\/locales(\/|$)/.test(arg);
          // console.log("ignore yml", tmp, arg);
          return ignore;
        }
      }),


      new WriteVersionsPlugin(path.join(config.cacheRoot, 'webpack.versions.json')),

      new MiniCssExtractPlugin({
        filename:      extHash("[name]", 'css'),
        chunkFilename: extHash("[id]", 'css'),
      }),

      new CssWatchRebuildPlugin(),

      new CopyWebpackPlugin(
        assetPaths.map(path => {
          return {
            from: path,
            to:   config.publicRoot
          }
        }),
        {debug: 'warning'}
      ),

      {
        apply: function (compiler) {
          if (process.env.WEBPACK_STATS) {
            compiler.plugin("done", function (stats) {
              stats = stats.toJson();
              fs.writeFileSync(`${config.tmpRoot}/stats.json`, JSON.stringify(stats));
            });
          }
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
    },


    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache:         true,
          parallel:      2,
          uglifyOptions: {
            ecma:     8,
            warnings: false,
            compress: {
              drop_console:  true,
              drop_debugger: true
            },
            output:   {
              beautify:     true,
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
