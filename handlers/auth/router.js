var Router = require('koa-router');
var config = require('config');
var register = require('./controller/register');
var verify = require('./controller/verify');
var reverify = require('./controller/reverify');
var disconnect = require('./controller/disconnect');
var forgot = require('./controller/forgot');
var forgotRecover = require('./controller/forgotRecover');
var logout = require('./controller/logout');
var login = require('./controller/login');
var loginAs = require('./controller/loginAs');
var xmpp = require('./controller/xmpp');
var mustBeAuthenticated = require('./lib/mustBeAuthenticated');
var mustBeAdmin = require('./lib/mustBeAdmin');
var mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
var passport = require('koa-passport');

require('./strategies');

var router = module.exports = new Router();

router.post('/login/local', function*(next) {
  var ctx = this;

  // @see node_modules/koa-passport/lib/framework/koa.js for passport.authenticate
  // it returns the middleware to delegate
  var middleware = passport.authenticate('local', function*(err, user, info) {
    // only callback-form of authenticate allows to assign ctx.body=info if 401

    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = info;
    } else {
      yield ctx.login(user);
      yield* ctx.rememberMe();
      ctx.body = {user: user.getInfoFields() };
    }
  });

  yield* middleware.call(this, next);

});

router.post('/logout', mustBeAuthenticated, logout.post);

if (process.env.NODE_ENV == 'development') {
  router.get('/out', require('./out').get); // GET logout for DEV
}

router.post('/register', mustNotBeAuthenticated, register.post);
router.post('/forgot', mustNotBeAuthenticated, forgot.post);

router.get('/login', login.get);

router.get('/login-as/:profileNameOrEmailOrId', loginAs.get);

router.get('/verify/:verifyEmailToken', verify.get);
router.get('/forgot-recover/:passwordResetToken?', mustNotBeAuthenticated, forgotRecover.get);
router.post('/forgot-recover', forgotRecover.post);


router.post('/reverify', reverify.post);

Object.keys(config.auth.providers).forEach(addProviderRoute);

function addProviderRoute(providerName) {
  var provider = config.auth.providers[providerName];

  // login
  router.get('/login/' + providerName, passport.authenticate(providerName, provider.passportOptions));

  // connect with existing profile
  router.get('/connect/' + providerName, mustBeAuthenticated, passport.authorize(providerName, provider.passportOptions));


  // http://stage.javascript.ru/auth/callback/facebook?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied#_=_

  router.get('/callback/' + providerName, function*(next) {
    var ctx = this;
    this.nocache();

    yield passport.authenticate(providerName, function*(err, user, info) {
      if (err) {
        // throw err would get swallowed (!!!)
        // so I must render error here
        ctx.renderError(err);
        return;
      }

      if (user) {
        yield ctx.login(user);
        yield ctx.rememberMe();
        ctx.body = ctx.render('popup-success');
        return;
      }

      var reason = info.message || info;

      ctx.body = ctx.render('popup-failure', { reason: reason });

    }).call(this, next);  // FIXME: we need it?

    yield* next;
  });
  /*
  router.get('/callback/' + providerName, passport.authenticate(providerName, {
      failureMessage:  true,
      successRedirect: '/auth/popup-success',
      failureRedirect: '/auth/popup-failure'
    })

  );*/
}

// these pages are not used if https site and https auth, because of direct opener<->popup communication
// but when site is http and popup is https, it redirects here
router.get('/popup-success', mustBeAuthenticated, function*() {
  this.nocache();
  this.body = this.render('popup-success');
});
router.post('/popup-failure', mustNotBeAuthenticated, function*() {
  this.nocache();
  this.body = this.render('popup-failure', {
    reason: this.request.body.reason
  });
});

// disconnect with existing profile
router.post('/disconnect/:providerName', mustBeAuthenticated, disconnect.post);

router.post('/xmpp', xmpp.post);
