let path = require('path');
let fs = require('fs');
let yaml = require('js-yaml');
let env = process.env;

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

//if (!env.SITE_HOST) throw new Error("env.SITE_HOST is not set");
//if (!env.STATIC_HOST) throw new Error("env.STATIC_HOST is not set");

let secret = require('./secret');

let lang = env.NODE_LANG || 'en';

require('util').inspect.defaultOptions.depth = 3;

if (env.DEV_TRACE) {
  Error.stackTraceLimit = 100000;
  require('trace');
  require('clarify');
}

let config = module.exports = {
  // production domain, for tutorial imports, descriptions, etc
  // for the places where in-dev we must use a real domain
  domain: {
    main:   'javascript.local',
    static: 'javascript.local'
  },

  server: {
    port:       env.PORT || 3000,
    host:       env.HOST || '0.0.0.0',
    siteHost:   env.SITE_HOST || '',
    staticHost: env.STATIC_HOST || ''
  },

  appKeys:  [secret.sessionKey],
  adminKey: secret.adminKey,

  lang:    lang,

  plnkrAuthId: secret.plnkrAuthId,

  assetVersioning: env.ASSET_VERSIONING == 'file' ? 'file' :
                     env.ASSET_VERSIONING == 'query' ? 'query' : null,

  pug:   {
    basedir: path.join(process.cwd(), 'templates'),
    cache:   env.NODE_ENV != 'development'
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
  tutorialGithubBaseUrl: 'https://github.com/iliakan/javascript-tutorial-' + lang + '/tree/master',

  handlers: require('./handlers')
};

require.extensions['.yml'] = function(module, filename) {
  module.exports = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'));
};


// after module.exports for circle dep w/ config
const t = require('i18n');

t.requirePhrase(''); // root locales

// webpack config uses general config
// we have a loop dep here
config.webpack = require('./webpack')(config);

