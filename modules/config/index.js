let path = require('path');
let fs = require('fs');
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
  publicRoot:            path.join(process.cwd(), 'public'),
  // private files, for expiring links, not directly accessible
  tutorialRoot:          env.TUTORIAL_ROOT || path.join(process.cwd(), '..', 'javascript-tutorial-' + lang),
  tmpRoot:               path.join(process.cwd(), 'tmp'),
  // js/css build versions
  cacheRoot:          path.join(process.cwd(), 'cache'),

  handlers: require('./handlers')
};

let repos = require('jsengine/koa/tutorial/repos');
for(let repo in repos) {
  if (repos[repo].lang === lang) {
    config.tutorialRepo = {
      github: repo,
      branch: repos[repo].branch || 'master',
      tree: new URL('https://github.com/' + repo + '/tree/' + (repos[repo].branch || 'master')),
      blob: new URL('https://github.com/' + repo + '/blob/' + (repos[repo].branch || 'master'))
    }
  }
}

require.extensions['.yml'] = function(module, filename) {
  module.exports = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'));
};


// after module.exports for circle dep w/ config
const t = require('jsengine/i18n');
t.requireHandlerLocales();

// webpack config uses general config
// we have a loop dep here
config.webpack = require('./webpack');

