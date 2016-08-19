const koaCsrf = require('koa-csrf');
const PathListCheck = require('pathListCheck');

function CsrfChecker() {
  this.ignore = new PathListCheck();
}


CsrfChecker.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') {
      return yield* next;
    }

    var checkCsrf = true;

    if (!this.user) {
      checkCsrf = false;
    }

    if (self.ignore.check(this.path)) {
      checkCsrf = false;
    }

    // If test check CSRF only when "X-Test-Csrf" header is set
    if (process.env.NODE_ENV == 'test') {
      if (!this.get('X-Test-Csrf')) {
        checkCsrf = false;
      }
    }

    if (checkCsrf) {
      this.assertCSRF(this.request.body);
    } else {
      this.log.debug("csrf skip");
    }

    yield* next;
  };
};


// every request gets different this._csrf to use in POST
// but ALL tokens are valid
exports.init = function(app) {
  koaCsrf(app);

  app.csrfChecker = new CsrfChecker();

  app.use(app.csrfChecker.middleware());

  app.use(function*(next) {

    try {
      // first, do the middleware, maybe authorize user in the process
      yield* next;
    } finally {
      // then if we have a user, set XSRF token
      if (this.req.user) {
        setCsrfCookie.call(this);
      }
    }

  });

};


// XSRF-TOKEN cookie name is used in angular by default
function setCsrfCookie() {

  try {
    // if this doesn't throw, the user has a valid token in cookie already
    this.assertCsrf({_csrf: this.cookies.get('XSRF-TOKEN') });
  } catch(e) {
    // error occurs if no token or invalid token (old session)
    // then we set a new (valid) one
    this.cookies.set('XSRF-TOKEN', this.csrf, { httpOnly: false, signed: false });
  }

}
