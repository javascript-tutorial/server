let path = require('path');
let fs = require('fs-extra');
let yaml = require('js-yaml');
let env = process.env;

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

let secret = require('./secret');

let lang = env.NODE_LANG || 'en';

require('util').inspect.defaultOptions.depth = 3;

if (env.DEV_TRACE) {
  Error.stackTraceLimit = 100000;
  require('trace');
  require('clarify');
}

let config = module.exports = {
  urlBase: {
    // node may be behind nginx, use this in documents
    main: new URL(env.URL_BASE_MAIN || env.URL_BASE || 'http://localhost:3000'),
    static: new URL(env.URL_BASE_STATIC || env.URL_BASE || 'http://localhost:3000'),
  },
  urlBaseProduction: {
    // when even in dev mode we must reference prod, use this (maybe remove it?)
    main: new URL(env.URL_BASE_PRODUCTION_MAIN || env.URL_BASE || 'http://localhost:3000'),
    static: new URL(env.URL_BASE_PRODUCTION_STATIC || env.URL_BASE || 'http://localhost:3000')
  },

  server: {
    port: env.PORT || 3000,
    host: env.HOST || 'localhost'
  },

  appKeys:  [secret.sessionKey],
  adminKey: secret.adminKey,

  certDir: path.join(secret.dir, 'cert'),
  
  lang:    lang,

  plnkrAuthId: secret.plnkrAuthId,

  assetVersioning: env.ASSET_VERSIONING === 'file' ? 'file' :
                     env.ASSET_VERSIONING === 'query' ? 'query' : null,

  pug:   {
    basedir: path.join(process.cwd(), 'templates'),
    cache:   env.NODE_ENV !== 'development'
  },

  supportEmail: 'iliakan@javascript.info',

  projectRoot:           process.cwd(),
  // public files, served by nginx
  publicRoot:            path.join(process.cwd(), 'public', lang),
  // private files, for expiring links, not directly accessible
  tutorialRoot:          env.TUTORIAL_ROOT || path.join(process.cwd(), 'repo', `${env.TUTORIAL_LANG || lang}.javascript.info`),
  tmpRoot:               path.join(process.cwd(), 'tmp', lang),
  // js/css build versions
  cacheRoot:          path.join(process.cwd(), 'cache', lang),
  assetsRoot:            path.join(process.cwd(), 'assets'),

  handlers: require('./handlers')
};

let repo = `javascript-tutorial/${config.lang}.javascript.info`;

config.tutorialRepo = {
  github: repo,
  url:    new URL('https://github.com/' + repo),
  tree:   new URL('https://github.com/' + repo + '/tree/master'),
  blob:   new URL('https://github.com/' + repo + '/blob/master')
};


require.extensions['.yml'] = function(module, filename) {
  module.exports = yaml.load(fs.readFileSync(filename, 'utf-8'));
};


// after module.exports for circle dep w/ config
const t = require('engine/i18n');
t.requireHandlerLocales();

// webpack config uses general config
// we have a loop dep here
config.webpack = require('./webpack');


createRoot(config.publicRoot);
createRoot(config.cacheRoot);
createRoot(config.tmpRoot);

function createRoot(root) {
  // may be existing symlink
  if (fs.existsSync(root) && fs.statSync(root).isFile()) {
    fs.unlinkSync(root);
  }
  if (!fs.existsSync(root)) {
    fs.ensureDirSync(root);
  }
}