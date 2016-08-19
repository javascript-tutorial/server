var path = require('path');
var mount = require('koa-mount');


// wrap('modulePath')
// is same as
// require('modulePath').middleware,
// but also calls apply/undo upon entering/leaving the middleware
//   --> here it does: this.templateDir = handlerModule dirname
module.exports = function(prefix, moduleDir) {

  // actually includes router when the middleware is accessed (mount prefix matches)
  var lazyRouterMiddleware = require('lib/lazyRouterMiddleware')(path.join(moduleDir, 'router'));

  function* wrapMiddleware(next) {
    var self = this;

    var templateDir = path.join(moduleDir, 'templates');

    // before entering middeware
    function apply() {
      self.templateDir = templateDir;
    }

    // before leaving middleware
    function undo() {
      delete self.templateDir;
    }

    apply();

    try {
      yield* lazyRouterMiddleware.call(this, function* () {
        // when middleware does yield next, undo changes
        undo();
        try {
          yield* next;
        } finally {
          // ...then apply back, when control goes back after yield next
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

