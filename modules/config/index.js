// make sure Promise is wrapped early,
// to assign mongoose.Promise = global.Promise the wrapped variant any time later
var path = require('path');
var fs = require('fs');
var env = process.env;
var yaml = require('js-yaml');

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

//if (!env.SITE_HOST) throw new Error("env.SITE_HOST is not set");
//if (!env.STATIC_HOST) throw new Error("env.STATIC_HOST is not set");

var secret = require('./secret');

var lang = env.NODE_LANG || 'ru';

if (env.DEV_TRACE) {
  Error.stackTraceLimit = 100000;
  require('trace');
  require('clarify');
}

var config = module.exports = {
  // production domain, for tutorial imports, descriptions, etc
  // for the places where in-dev we must use a real domain
  domain: {
    main:   'javascript.in',
    static: 'javascript.in'
  },

  server: {
    port:       env.PORT || 3000,
    host:       env.HOST || '127.0.0.1',
    siteHost:   env.SITE_HOST || '',
    staticHost: env.STATIC_HOST || ''
  },

  mongoose: require('./mongoose'),

  appKeys:  [secret.sessionKey],
  adminKey: secret.adminKey,

  lang:    lang,

  plnkrAuthId: secret.plnkrAuthId,

  assetVersioning: env.ASSET_VERSIONING == 'file' ? 'file' :
                     env.ASSET_VERSIONING == 'query' ? 'query' : null,

  jade:   {
    basedir: path.join(process.cwd(), 'templates'),
    cache:   env.NODE_ENV != 'development'
  },

  projectRoot:           process.cwd(),
  // public files, served by nginx
  publicRoot:            path.join(process.cwd(), 'public'),
  // private files, for expiring links, not directly accessible
  downloadRoot:          path.join(process.cwd(), 'download'),
  archiveRoot:           path.join(process.cwd(), 'archive'),
  tmpRoot:               path.join(process.cwd(), 'tmp'),
  localesRoot:           path.join(process.cwd(), 'locales'),
  // js/css build versions
  manifestRoot:          path.join(process.cwd(), 'manifest'),
  migrationsRoot:        path.join(process.cwd(), 'migrations'),
  tutorialGithubBaseUrl: 'https://github.com/iliakan/javascript-tutorial/blob/' + lang,

  handlers: require('./handlers')
};

require.extensions['.yml'] = function(module, filename) {
  module.exports = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'));
};


// webpack config uses general config
// we have a loop dep here
config.webpack = require('./webpack')(config);

const t = require('i18n');
t.requirePhrase('site', require(path.join(config.localesRoot, 'site', config.lang + '.yml')));

