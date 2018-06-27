const koaCsrf = require('koa-csrf');
const PathListCheck = require('pathListCheck');

class CsrfChecker {
  constructor() {
    this.ignore = new PathListCheck();
  }


  middleware() {
    let self = this;

    return async function (ctx, next) {
      // skip these methods
      if (ctx.method === 'GET' || ctx.method === 'HEAD' || ctx.method === 'OPTIONS') {
        return await next();
      }

      let checkCsrf = true;

      if (!ctx.user) {
        checkCsrf = false;
      }

      if (self.ignore.check(ctx.path)) {
        checkCsrf = false;
      }

      // If test check CSRF only when "X-Test-Csrf" header is set
      if (process.env.NODE_ENV === 'test') {
        if (!ctx.get('X-Test-Csrf')) {
          checkCsrf = false;
        }
      }

      if (checkCsrf) {
        ctx.assertCSRF(ctx.request.body);
      } else {
        ctx.log.debug("csrf skip");
      }

      await next();
    };
  };
}


// every request gets different ctx._csrf to use in POST
// but ALL tokens are valid
exports.init = function(app) {
  koaCsrf(app);

  app.csrfChecker = new CsrfChecker();

  app.use(app.csrfChecker.middleware());

  app.use(async function(ctx, next) {

    try {
      // first, do the middleware, maybe authorize user in the process
      await next();
    } finally {
      // then if we have a user, set XSRF token
      if (ctx.req.user) {
        setCsrfCookie(ctx);
      }
    }

  });

};


// XSRF-TOKEN cookie name is used in angular by default
function setCsrfCookie(ctx) {

  try {
    // if ctx doesn't throw, the user has a valid token in cookie already
    ctx.assertCsrf({_csrf: ctx.cookies.get('XSRF-TOKEN')});
  } catch (e) {
    // error occurs if no token or invalid token (old session)
    // then we set a new (valid) one
    ctx.cookies.set('XSRF-TOKEN', ctx.csrf, {httpOnly: false, signed: false});
  }

}
