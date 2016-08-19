'use strict';

exports.mustBeAuthenticated = require('./lib/mustBeAuthenticated');
exports.mustNotBeAuthenticated = require('./lib/mustNotBeAuthenticated');
exports.mustBeAdmin = require('./lib/mustBeAdmin');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {

  require('./strategies');

  // no csrf check for guest endpoints (no generation of csrf for anon)
  app.csrfChecker.ignore.add('/auth/login/:any*');
  app.csrfChecker.ignore.add('/auth/register');
  app.csrfChecker.ignore.add('/auth/reverify');
  app.csrfChecker.ignore.add('/auth/forgot');
  app.csrfChecker.ignore.add('/auth/forgot-recover');

  // add methods BEFORE adding other auth routes (that may want these methods)
  app.use(function*(next) {

    this.logout = function() {
      this.cookies.set('remember'); // remove "remember me" cookie
      this.cookies.set('remember.sig');

      this.cookies.set('sid'); // logout removes sid, but not sid.sig (3rd party bug?)
      this.cookies.set('sid.sig');

      this.session = null;
      this.req.logout();
    };

    this.authAndRedirect = function(url) {
      this.addFlashMessage('info', 'Для доступа к этой странице нужна авторизация.');
      this.newFlash.successRedirect = url;
      this.redirect('/auth/login');
    };

    yield* next;
  });

  app.use(mountHandlerMiddleware('/auth', __dirname));


};



