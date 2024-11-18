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

  const TerserPlugin = require('terser-webpack-plugin');
  const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
      devtoolNamespace: 'wp',
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

    devtool: devMode
      ? 'inline-cheap-module-source-map' // try "eval" ?
      : process.env.NODE_ENV === 'production'
      ? 'source-map'
      : false,

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
          use:  'yaml-loader'
        },
        {
          // make t global, so that it will not be defined in the compiled template function
          // and i18n plugin will substitute
          test: /\.pug/,
          use:  'pug-loader?root=' + config.projectRoot + '/templates&globals=__'
        },
        {
          test:    /\.js$/,
          // babel shouldn't process modules which contain ws/browser.js,
          // which must not be run in strict mode (global becomes undefined)
          // babel would make all modules strict!
          exclude(path) {
            return noProcessModulesRegExp.test(path) || path.includes('node_modules/monaco-editor') || devMode;
          },
          use:     [
            // babel will work first
            {
              loader:  'babel-loader',
              options: {
                plugins: [
                  require.resolve('@babel/plugin-proposal-object-rest-spread')
                ],
                presets: [
                  [require.resolve('@babel/preset-env'), {
                    //useBuiltIns: true,
                    targets: {
                      // not ie11, don't want regenerator-runtime and @babel/plugin-transform-runtime
                      browsers: '> 3%'
                    }
                  }]
                ]
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
            },
          ],
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
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')
                  ]
                }
              }
            },
            'engine/webpack/hover-loader',
            {
              loader:  'stylus-loader',
              options: {
                stylusOptions: {
                  linenos:       true,
                  'resolve url': true,
                  use:           [
                    rupture(),
                    nib(),
                    function(style) {
                      style.define('lang', config.lang);
                      style.define('isRTL', ['ar','fa','he'].includes(process.env.TUTORIAL_LANG));
                      style.define('env', config.env);
                    }
                  ]
                }
              },
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|woff|woff2|eot|otf|ttf|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: extHash('[name]','[ext]'), // Keeps the original file name and extension
          },
        }
      ],
      noParse(path) {
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
        'entities/maps/entities.json': 'engine/markit/emptyEntities',
        'entities/lib/maps/entities.json': 'engine/markit/emptyEntities',
        config: 'client/config',
      },
      fallback: {
        fs: false,  // Replace 'empty' with 'false' in Webpack 5 to exclude it
      },
      modules: modulesDirectories,
      mainFields: ['browser', 'main', 'module'] // maybe not needed, from eslint webpack
    },


    resolveLoader: {
      modules:    modulesDirectories,
      extensions: ['.js']
    },

    performance: {
      maxEntrypointSize: 350000,
      maxAssetSize: 350000, // warning if asset is bigger than 300k
      assetFilter(assetFilename) {
        // only check js/css
        // ignore assets copied by CopyWebpackPlugin
        if (assetFilename.startsWith('..')) {
          // they look like ../courses/achievements/course-complete.svg
          // built assets do not have ..
          return false;
        }
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      },
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


      new webpack.IgnorePlugin({
        resourceRegExp: /fs-extra$/
      }),

      // ignore all moment.js locales except current lang
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // locale requires that file back from it, need to keep it
          if (resource === '../moment') return false; // don't ignore this
          if (resource.startsWith('./' + config.lang)) return false; // don't ignore current locale ./ru ./ru.js ./zh ./zh-cn.js

          let ignore = context.endsWith(path.join('node_modules', 'moment', 'locale'));

          if (ignore) {
            // console.log("Ignore", resource, context);
            return true;
          }
          return false;
        },
      }),

      // ignore site locale files except the lang
      new webpack.IgnorePlugin({

        checkResource(resource, context) {
          let isYmlForAnotherLanguage = resource.endsWith('.yml') && !resource.endsWith('/' + config.lang + '.yml');
          let isUnderLocales = /\/locales(\/|$)/.test(context);
          if (isYmlForAnotherLanguage && isUnderLocales) return true;

          // console.log("checkResource", resource, context);
          return false;
        }
      }),


      new WriteVersionsPlugin(path.join(config.buildRoot, 'webpack', 'versions', 'all.json')),

      new MiniCssExtractPlugin({
        filename:      extHash("[name]", 'css'),
        chunkFilename: extHash("[id]", 'css'),
      }),

      new CssWatchRebuildPlugin(),

      new CopyWebpackPlugin({
        patterns: assetPaths.map((path) => {
          return {
            from: path,
            to: config.publicRoot,
            info: (file) => ({ minimized: true }),
            noErrorOnMissing: true
          };
        })
      }),

      {
        apply(compiler) {
          if (process.env.WEBPACK_STATS) {
            compiler.hooks.done.tap('MyStats', (stats) => {
              stats = stats.toJson();
              let dir = path.join(config.buildRoot, 'webpack', 'stats');
              fs.ensureDirSync(dir);
              fs.writeFileSync(path.join(dir, entryName + '.json'), JSON.stringify(stats));
            });
          }
        },
      },
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
        new TerserPlugin({
          parallel: 2,
          terserOptions: {
            ecma: 2022,
            warnings: false,
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            output: {
              beautify: true,
              indent_level: 0, // for error reporting, to see which line actually has the problem
              // source maps actually didn't work in Qbaka that's why I put it here
            },
          },
        }),
        new CssMinimizerPlugin({}),
      ],
    }
  };


//if (process.env.NODE_ENV != 'development') { // production, ebook
/*
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
*/
  return webpackConfig;
};
