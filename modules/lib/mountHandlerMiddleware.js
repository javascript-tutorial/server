let path = require('path');
let mount = require('koa-mount');


// wrap('modulePath')
// is same as
// require('modulePath').middleware,
// but also calls apply/undo upon entering/leaving the middleware
//   --> here it does: this.templateDir = handlerModule dirname
module.exports = function(prefix, moduleDir) {

  // actually includes router when the middleware is accessed (mount prefix matches)
  let lazyRouterMiddleware = require('lib/lazyRouterMiddleware')(path.join(moduleDir, 'router'));

  async function wrapMiddleware(ctx, next) {
    let templateDir = path.join(moduleDir, 'templates');

    // before entering middeware
    let apply = () => self.templateDir = templateDir;

    // before leaving middleware
    let undo = () => delete self.templateDir;

    apply();

    try {
      await lazyRouterMiddleware(ctx, async function() {
        // when middleware does await next, undo changes
        undo();
        try {
          await next;
        } finally {
          // ...then apply back, when control goes back after await next
          apply();
        }
      }());

    } finally {
      undo();
    }

  }

  // /users/me  -> /me
  return mount(prefix, wrapMiddleware);

};

